export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

type Bucket = { count: number; resetAt: number };
type Method = 'GET' | 'PUT' | 'POST';

const WINDOW_MS = 60_000;
const LIMITS: Record<Method, number> = {
  GET: 90,
  PUT: 30,
  POST: 12,
};
const MAX_BUCKETS = 4_000;

const rateLimitGlobal = globalThis as typeof globalThis & {
  __pelicanApiRateBuckets?: Map<string, Bucket>;
};
const buckets = rateLimitGlobal.__pelicanApiRateBuckets ?? new Map<string, Bucket>();
rateLimitGlobal.__pelicanApiRateBuckets = buckets;

function clientKey(request: Request) {
  const ip = request.headers.get('x-vercel-forwarded-for')
    ?? request.headers.get('x-forwarded-for')
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
  return ip.split(',')[0]?.trim().slice(0, 80) || 'unknown';
}

function prune(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size < MAX_BUCKETS) return;
  const overflow = buckets.size - Math.floor(MAX_BUCKETS * 0.8);
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }
}

/**
 * Best-effort warm-instance limiter. Vercel Firewall should remain the primary
 * globally consistent rate limiter; this protects function work when a request
 * still reaches the route.
 */
export function checkRunApiRateLimit(request: Request, method: Method, now = Date.now()): RateLimitResult {
  prune(now);
  const limit = LIMITS[method];
  const key = `${method}:${clientKey(request)}`;
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + WINDOW_MS }
    : current;
  bucket.count += 1;
  buckets.set(key, bucket);
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return { allowed: bucket.count <= limit, limit, remaining, resetAt: bucket.resetAt, retryAfter };
}

export function resetRunApiRateLimitForTests() {
  buckets.clear();
}

export function isJsonRequest(request: Request) {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  return contentType === 'application/json' || contentType.startsWith('application/json;');
}
