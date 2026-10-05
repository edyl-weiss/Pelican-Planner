import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { BlobPreconditionFailedError, get, put } from '@vercel/blob';
import { z } from 'zod';
import { runSchema } from '@/lib/game/state';
import { nextSavedRecord, savedRecordSchema } from '@/lib/game/saved-record';
import { checkRunApiRateLimit, isJsonRequest, type RateLimitResult } from '@/lib/server/request-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-stardew-farm' : 'stardew-farm';
const storeId = process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN_STORE_ID;
const MAX_BODY_BYTES = 4_000_000;
const BLOB_TIMEOUT_MS = 9_000;
const submissionSchema = z.object({ state: runSchema, revision: z.number().int().min(0).max(2_000_000_000) });

function session(request: NextRequest) {
  const value = request.cookies.get(COOKIE)?.value;
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}
function pathname(secret: string) {
  return `farms/${createHash('sha256').update(secret).digest('hex')}.json`;
}
function json(body: unknown, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', ...headers },
  });
}
function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
function rateLimited(request: NextRequest, method: 'GET' | 'PUT' | 'POST') {
  const result = checkRunApiRateLimit(request, method);
  if (result.allowed) return null;
  return json(
    { error: 'Too many save-service requests from this connection. Please wait a moment and try again.', code: 'api_rate_limited' },
    429,
    { ...rateLimitHeaders(result), 'Retry-After': String(result.retryAfter) },
  );
}
function withSession(response: NextResponse, secret: string) {
  response.cookies.set(COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 31_536_000,
  });
  return response;
}
function validateOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const crossSite = request.headers.get('sec-fetch-site') === 'cross-site';
  return !crossSite && (!origin || origin === request.nextUrl.origin);
}
function blobOptions() {
  return {
    access: 'private' as const,
    useCache: false,
    abortSignal: AbortSignal.timeout(BLOB_TIMEOUT_MS),
    ...(storeId ? { storeId } : {}),
  };
}
async function readRecord(secret: string) {
  const result = await get(pathname(secret), blobOptions());
  if (!result) return null;
  if (result.statusCode !== 200 || !result.stream) throw new Error('Saved farm could not be read.');
  if ((result.blob.size ?? 0) > 8_100_000) throw new Error('Saved farm exceeds the supported size.');
  const data: unknown = await new Response(result.stream).json();
  return { record: savedRecordSchema.parse(data), etag: result.blob.etag };
}
function errorName(error: unknown) {
  return error && typeof error === 'object' && 'constructor' in error
    ? (error as { constructor?: { name?: string } }).constructor?.name ?? ''
    : '';
}
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : '';
}
function isBlobConfigurationError(error: unknown) {
  const name = errorName(error);
  const message = errorMessage(error);
  return /BlobAccessError|BlobOidcEnvironmentNotAllowedError|BlobStoreNotFoundError|BlobStoreSuspendedError/.test(name)
    || /No blob credentials found|no storeId was found|BLOB_STORE_ID|BLOB_READ_WRITE_TOKEN|OIDC.*environment|Access denied|store does not exist|store has been suspended/i.test(message);
}
function isBlobRateLimit(error: unknown) {
  return errorName(error) === 'BlobServiceRateLimited' || /Too many requests|rate.?limit/i.test(errorMessage(error));
}
function isTransientBlobError(error: unknown) {
  const name = errorName(error);
  const message = errorMessage(error);
  return /BlobServiceNotAvailable|BlobRequestAbortedError/.test(name)
    || /service is currently not available|request was aborted|fetch failed|network|timed? ?out|timeout/i.test(message);
}
function localDraftNotice(error: unknown) {
  if (isBlobConfigurationError(error)) {
    return 'Cloud saving is unavailable in this deployment right now. You can still use Pelican Planner in this browser and export a backup; reconnect the project to its private Vercel Blob store to restore cloud saves.';
  }
  return 'Cloud saving is temporarily unavailable. You can still use Pelican Planner in this browser and export a backup, then try cloud saving again later.';
}
function storageError(error: unknown) {
  if (error instanceof BlobPreconditionFailedError || /already exists|ETag mismatch|revision conflict/i.test(errorMessage(error))) {
    return json({ error: 'This farm changed in another tab. Export your draft, then reload before saving.', code: 'save_conflict' }, 409);
  }
  if (isBlobRateLimit(error)) {
    const retryAfter = error && typeof error === 'object' && 'retryAfter' in error
      ? Number((error as { retryAfter?: unknown }).retryAfter)
      : 0;
    console.warn('Vercel Blob rate limited a farm request.');
    return json(
      { error: 'Cloud saving is busy right now. Your draft is still in this browser; please try again shortly.', code: 'blob_rate_limited' },
      429,
      retryAfter > 0 ? { 'Retry-After': String(Math.ceil(retryAfter)) } : undefined,
    );
  }
  if (isBlobConfigurationError(error)) {
    console.error('Vercel Blob is not available to this deployment:', errorMessage(error) || errorName(error));
    return json({
      error: 'Cloud saving is not connected to this deployment. You can keep using the planner and export a backup, then reconnect the project to its private Vercel Blob store.',
      code: 'blob_credentials_unavailable',
    }, 503);
  }
  if (isTransientBlobError(error)) {
    console.warn('Vercel Blob request failed temporarily:', errorMessage(error) || errorName(error));
    return json({ error: 'Cloud saving is temporarily unavailable. Your browser draft is safe; please try again.', code: 'blob_temporarily_unavailable' }, 503);
  }
  if (error instanceof Error) console.error('Vercel Blob operation failed:', error.message);
  return json({ error: 'Cloud saving is unavailable. Keep this tab open or export your planner backup, then try again.', code: 'blob_unavailable' }, 503);
}

export async function GET(request: NextRequest) {
  const limited = rateLimited(request, 'GET');
  if (limited) return limited;
  const existingSecret = session(request);
  const secret = existingSecret ?? randomBytes(32).toString('hex');
  try {
    const saved = await readRecord(secret);
    return withSession(json(saved
      ? { state: saved.record.state, revision: saved.record.revision, updated: saved.record.updated, hasBackup: Boolean(saved.record.backup), cloudAvailable: true }
      : { state: null, revision: 0, cloudAvailable: true }), secret);
  } catch (error) {
    // A brand-new visitor has no cloud record to lose. Let the planner open in local-draft
    // mode instead of making a transient/misconfigured Blob store block the whole app.
    if (!existingSecret) {
      console.warn('Opening a fresh local draft because cloud storage could not be reached:', errorMessage(error) || errorName(error));
      return withSession(json({ state: null, revision: 0, cloudAvailable: false, notice: localDraftNotice(error) }), secret);
    }
    return storageError(error);
  }
}

export async function PUT(request: NextRequest) {
  const limited = rateLimited(request, 'PUT');
  if (limited) return limited;
  if (!validateOrigin(request)) return json({ error: 'Request origin mismatch.' }, 403);
  const secret = session(request);
  if (!secret) return json({ error: 'Open the planner in this browser before saving. Cookies must be enabled.' }, 401);
  if (!isJsonRequest(request)) return json({ error: 'Save requests must use application/json.' }, 415);
  try {
    const contentLength = Number.parseInt(request.headers.get('content-length') ?? '0', 10);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return json({ error: 'This farm is too large to save.' }, 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: 'This farm is too large to save.' }, 413);
    const body = submissionSchema.safeParse(JSON.parse(raw));
    if (!body.success) return json({ error: 'Invalid farm data. Check dates and quantities.' }, 400);
    const current = await readRecord(secret);
    if ((current?.record.revision ?? 0) !== body.data.revision) return json({ error: 'This farm changed in another tab. Export this draft, then reload before saving.', code: 'save_conflict' }, 409);
    const next = nextSavedRecord(current?.record ?? null, body.data.state, body.data.revision);
    await put(pathname(secret), JSON.stringify(next), {
      ...(storeId ? { storeId } : {}),
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: Boolean(current),
      contentType: 'application/json',
      cacheControlMaxAge: 60,
      abortSignal: AbortSignal.timeout(BLOB_TIMEOUT_MS),
      ...(current ? { ifMatch: current.etag } : {}),
    });
    return json({ revision: next.revision, updated: next.updated, cloudAvailable: true });
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: 'The save data is not valid JSON.' }, 400);
    return storageError(error);
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimited(request, 'POST');
  if (limited) return limited;
  if (!validateOrigin(request)) return json({ error: 'Request origin mismatch.' }, 403);
  const secret = session(request);
  if (!secret) return json({ error: 'Open the planner in this browser before recovering a save. Cookies must be enabled.' }, 401);
  try {
    const saved = await readRecord(secret);
    if (!saved?.record.backup) return json({ error: 'No previous saved version is available.' }, 404);
    return json({ state: saved.record.backup });
  } catch (error) {
    return storageError(error);
  }
}
