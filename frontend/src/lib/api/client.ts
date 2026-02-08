import { useAuthStore } from '@/store/useAuthStore';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface ApiErrorPayload {
  status: number;
  data: unknown;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, payload: ApiErrorPayload) {
    super(message);
    this.status = payload.status;
    this.data = payload.data;
  }
}

async function refreshAccessToken() {
  const { refreshToken, setTokens } = useAuthStore.getState();
  if (!refreshToken) return null;

  const response = await fetch(`${baseUrl}/api/users/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken })
  });

  if (!response.ok) {
    setTokens(null, null);
    return null;
  }

  const data = (await response.json()) as { access: string; refresh?: string };
  setTokens(data.access, data.refresh ?? refreshToken);
  return data.access;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401 && options.auth !== false) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      const retryResponse = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers
      });
      if (retryResponse.ok) {
        return retryResponse.json();
      }
      const errorData = await retryResponse.json().catch(() => ({}));
      throw new ApiError('Request failed', {
        status: retryResponse.status,
        data: errorData
      });
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError('Request failed', { status: response.status, data: errorData });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
