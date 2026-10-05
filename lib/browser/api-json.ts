const STATUS_MESSAGES: Record<number, string> = {
  401: 'This browser could not start a cloud-save session. Make sure cookies are enabled, then reload.',
  403: 'The save request was blocked because its origin could not be verified. Reload Pelican Planner and try again.',
  409: 'This farm changed in another tab. Export your draft, then reload before saving.',
  413: 'This farm is too large to save to the cloud.',
  415: 'The save request format was rejected. Reload Pelican Planner and try again.',
  429: 'Cloud saving is busy right now. Your browser draft is still available; please try again shortly.',
  500: 'Pelican Planner’s save service hit an unexpected error. Your browser draft is still available.',
  502: 'Pelican Planner’s save service is temporarily unreachable. Your browser draft is still available.',
  503: 'Cloud saving is temporarily unavailable. Your browser draft is still available.',
  504: 'Cloud saving took too long to respond. Your browser draft is still available.',
};

function fallbackMessage(status: number) {
  return STATUS_MESSAGES[status] ?? `The save service returned an unexpected response (${status}). Your browser draft is still available.`;
}

const TRANSIENT_STATUSES = new Set([429, 502, 503, 504]);
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchApiJson<T extends Record<string, unknown>>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const attempts = method === 'GET' ? 2 : 1;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(input, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...init,
    });
    const raw = await response.text();
    let parsed: unknown = {};
    if (raw.trim()) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        if (!response.ok) {
          if (attempt + 1 < attempts && TRANSIENT_STATUSES.has(response.status)) {
            await pause(250);
            continue;
          }
          throw new Error(fallbackMessage(response.status));
        }
        throw new Error('The save service returned an unreadable response. Your browser draft is still available; please reload and try again.');
      }
    }
    const data = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    if (!response.ok) {
      if (attempt + 1 < attempts && TRANSIENT_STATUSES.has(response.status)) {
        await pause(250);
        continue;
      }
      const message = typeof data.error === 'string' && data.error.trim() ? data.error : fallbackMessage(response.status);
      throw new Error(message);
    }
    return data as T;
  }
  throw new Error('The save service is temporarily unavailable. Your browser draft is still available.');
}
