import { apiFetch } from '@/lib/api/client';

export async function sendChatMessage(payload: { message: string }) {
  return apiFetch('/api/chat/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
