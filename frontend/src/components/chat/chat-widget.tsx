'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendChatMessage } from '@/lib/api/endpoints/chat';
import { useToastStore } from '@/store/useToastStore';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { addToast } = useToastStore();

  const handleSend = async () => {
    if (!message) return;
    try {
      await sendChatMessage({ message });
      addToast({ title: 'Message sent', description: 'We will get back to you soon.' });
      setMessage('');
    } catch (error) {
      addToast({
        title: 'Chat unavailable',
        description: 'Chatbot endpoint is not configured yet.',
        variant: 'error'
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open ? (
        <div className="w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Ask Rockflint</p>
            <button
              className="text-xs text-slate-500"
              onClick={() => setOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Chatbot integration pending backend endpoint.
          </p>
          <div className="mt-4 flex gap-2">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about a property..."
            />
            <Button size="sm" onClick={handleSend}>
              Send
            </Button>
          </div>
        </div>
      ) : (
        <Button size="lg" className="rounded-full" onClick={() => setOpen(true)}>
          <MessageCircle className="h-5 w-5" /> Chat
        </Button>
      )}
    </div>
  );
}
