'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { useToastStore } from '@/store/useToastStore';

const variantStyles: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
};

export function ToastStack() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed right-6 top-6 z-50 flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-xl border p-4 shadow-lg ${
              variantStyles[toast.variant ?? 'info']
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-300"
                onClick={() => removeToast(toast.id)}
                type="button"
              >
                Close
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
