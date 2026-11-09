'use client';

/**
 * Browser-side calls. These hit this app's own /api/* which Next proxies to
 * the NestJS service, so the session cookie is always first-party.
 */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`/api${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: {
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    if (response.status === 204) return { ok: true, data: undefined as T };

    const text = await response.text();
    const payload: unknown = text ? safeJson(text) : null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: extractError(payload) ?? `Request failed (${response.status})`,
      };
    }
    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, status: 0, error: 'Network error — is the API running?' };
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractError(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const message = (payload as { message?: unknown }).message;
  if (Array.isArray(message)) return String(message[0]);
  if (typeof message === 'string') return message;
  return null;
}

export function loginHref(nextPath: string): string {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}
