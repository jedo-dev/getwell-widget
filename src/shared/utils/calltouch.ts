type AnyWindow = Window & Record<string, unknown>;

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function getCookieValue(cookieName: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const escaped = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  if (!match || !match[1]) {
    return undefined;
  }

  return decodeURIComponent(match[1]);
}

function extractSessionIdFromCalltrackingParams(
  params: unknown,
): string | undefined {
  if (!params || typeof params !== 'object') {
    return undefined;
  }

  if (Array.isArray(params)) {
    for (const item of params) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const sessionId = asNonEmptyString((item as Record<string, unknown>).sessionId);
      if (sessionId) {
        return sessionId;
      }
    }
    return undefined;
  }

  return asNonEmptyString((params as Record<string, unknown>).sessionId);
}

export function getCalltouchSessionId(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const w = window as unknown as AnyWindow;

  // По документации Calltouch: window.ct('calltracking_params') -> { sessionId } или [{ sessionId }]
  if (typeof w.ct === 'function') {
    try {
      const params = (w.ct as (...args: unknown[]) => unknown)('calltracking_params');
      const sessionId = extractSessionIdFromCalltrackingParams(params);
      if (sessionId) {
        return sessionId;
      }
    } catch {
      // no-op: переходим к fallback-источникам
    }
  }

  // По документации Calltouch: fallback из cookie _ct_session_id
  const cookieSessionId = asNonEmptyString(getCookieValue('_ct_session_id'));
  if (cookieSessionId) {
    return cookieSessionId;
  }

  const directCandidates: unknown[] = [
    w.calltouch_session_id,
    w.calltouchSessionId,
    w.session_id,
  ];

  for (const candidate of directCandidates) {
    const value = asNonEmptyString(candidate);
    if (value) {
      return value;
    }
  }

  const nestedSources: unknown[] = [w.calltouch, w.Calltouch];
  for (const source of nestedSources) {
    if (!source || typeof source !== 'object') {
      continue;
    }

    const obj = source as Record<string, unknown>;
    const nestedCandidates = [
      obj.session_id,
      obj.calltouch_session_id,
      obj.sessionId,
      obj.calltouchSessionId,
    ];

    for (const candidate of nestedCandidates) {
      const value = asNonEmptyString(candidate);
      if (value) {
        return value;
      }
    }
  }

  return undefined;
}
