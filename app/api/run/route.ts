import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { get, put } from '@vercel/blob';
import { z } from 'zod';
import { runSchema } from '@/lib/game/state';
import { nextSavedRecord, savedRecordSchema } from '@/lib/game/saved-record';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-stardew-farm' : 'stardew-farm';
const MAX_BODY_BYTES = 500_000;
const submissionSchema = z.object({ state: runSchema, revision: z.number().int().min(0).max(2_000_000_000) });

function session(request: NextRequest) {
  const value = request.cookies.get(COOKIE)?.value;
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}
function pathname(secret: string) {
  return `farms/${createHash('sha256').update(secret).digest('hex')}.json`;
}
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie' } });
}
function withSession(response: NextResponse, secret: string) {
  response.cookies.set(COOKIE, secret, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 31_536_000,
  });
  return response;
}
function validateOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const crossSite = request.headers.get('sec-fetch-site') === 'cross-site';
  return !crossSite && (!origin || origin === request.nextUrl.origin);
}
async function readRecord(secret: string) {
  const result = await get(pathname(secret), { access: 'private', useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200 || !result.stream) throw new Error('Saved farm could not be read.');
  if ((result.blob.size ?? 0) > 1_200_000) throw new Error('Saved farm exceeds the supported size.');
  const data: unknown = await new Response(result.stream).json();
  return { record: savedRecordSchema.parse(data), etag: result.blob.etag };
}
function storageError(error: unknown) {
  if (error instanceof Error && (error.name === 'BlobPreconditionFailedError' || /already exists/i.test(error.message))) {
    return json({ error: 'This farm changed in another tab. Export your draft, then reload before saving.' }, 409);
  }
  if (error instanceof Error && /No blob credentials found|no storeId was found|BLOB_STORE_ID|BLOB_READ_WRITE_TOKEN/i.test(error.message)) {
    console.error('Vercel Blob credentials are unavailable to this deployment:', error.message);
    return json({
      error: 'Vercel did not expose the connected Blob store to this deployment. In the Blob store’s Projects tab, connect this project to Production, then create a new Production deployment.',
      code: 'blob_credentials_unavailable',
    }, 503);
  }
  if (error instanceof Error) console.error('Vercel Blob operation failed:', error.message);
  return json({ error: 'Cloud saving is unavailable. Keep this tab open or export your journal, then try again.' }, 503);
}

export async function GET(request: NextRequest) {
  const secret = session(request) ?? randomBytes(32).toString('hex');
  try {
    const saved = await readRecord(secret);
    return withSession(json(saved ? { state: saved.record.state, revision: saved.record.revision, updated: saved.record.updated, hasBackup: Boolean(saved.record.backup) } : { state: null, revision: 0 }), secret);
  } catch (error) { return storageError(error); }
}

export async function PUT(request: NextRequest) {
  if (!validateOrigin(request)) return json({ error: 'Request origin mismatch.' }, 403);
  const secret = session(request);
  if (!secret) return json({ error: 'Open the journal in this browser before saving. Cookies must be enabled.' }, 401);
  try {
    if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return json({ error: 'This farm is too large to save.' }, 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: 'This farm is too large to save.' }, 413);
    const body = submissionSchema.safeParse(JSON.parse(raw));
    if (!body.success) return json({ error: 'Invalid farm data. Check dates and quantities.' }, 400);
    const current = await readRecord(secret);
    if ((current?.record.revision ?? 0) !== body.data.revision) return json({ error: 'This farm changed in another tab. Export this draft, then reload before saving.' }, 409);
    const next = nextSavedRecord(current?.record ?? null, body.data.state, body.data.revision);
    await put(pathname(secret), JSON.stringify(next), {
      access: 'private', addRandomSuffix: false, allowOverwrite: Boolean(current), contentType: 'application/json', cacheControlMaxAge: 60,
      ...(current ? { ifMatch: current.etag } : {}),
    });
    return json({ revision: next.revision, updated: next.updated });
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: 'The save data is not valid JSON.' }, 400);
    return storageError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) return json({ error: 'Request origin mismatch.' }, 403);
  const secret = session(request);
  if (!secret) return json({ error: 'Open the journal in this browser before recovering a save.' }, 401);
  try {
    const saved = await readRecord(secret);
    if (!saved?.record.backup) return json({ error: 'No previous saved version is available.' }, 404);
    return json({ state: saved.record.backup });
  } catch (error) { return storageError(error); }
}
