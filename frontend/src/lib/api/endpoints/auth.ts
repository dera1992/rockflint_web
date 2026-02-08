import { apiFetch } from '@/lib/api/client';
import type { ProfilePayload, UserProfile } from '@/lib/api/types';

export interface LoginResponse {
  access: string;
  refresh: string;
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
}) {
  return apiFetch('/api/users/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false
  });
}

export async function login(payload: { email: string; password: string; remember_me?: boolean }) {
  return apiFetch<LoginResponse>('/api/users/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false
  });
}

export async function loginWithOtp(payload: { email: string; password: string; remember_me?: boolean }) {
  return apiFetch<{ otp_required: boolean; user_id: number; remember_me: boolean }>(
    '/api/users/auth/login/',
    {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false
    }
  );
}

export async function verifyOtp(payload: { user_id: number; otp: string; remember_me?: boolean }) {
  return apiFetch<LoginResponse>('/api/users/auth/verify-otp/', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false
  });
}

export async function refreshToken(payload: { refresh: string }) {
  return apiFetch<LoginResponse>('/api/users/token/refresh/', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false
  });
}

export async function fetchMe() {
  return apiFetch<UserProfile>('/api/users/me/');
}

export async function updateProfile(payload: ProfilePayload) {
  return apiFetch('/api/users/profile/', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function passwordReset(email: string) {
  return apiFetch('/api/users/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
    auth: false
  });
}

export async function passwordResetConfirm(payload: { token: string; new_password: string }) {
  return apiFetch('/api/users/password-reset/confirm/', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false
  });
}

export async function changePassword(payload: { old_password: string; new_password: string }) {
  return apiFetch('/api/users/change-password/', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deactivateAccount() {
  return apiFetch('/api/users/deactivate/', {
    method: 'POST'
  });
}

export async function deleteAccount() {
  return apiFetch('/api/users/delete/', {
    method: 'DELETE'
  });
}

export async function activateAccount(uidb64: string, token: string) {
  return apiFetch(`/api/users/activate/${uidb64}/${token}/`, {
    method: 'GET',
    auth: false
  });
}
