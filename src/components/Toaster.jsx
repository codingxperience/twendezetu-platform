'use client';

import { useStore } from '@/store';
import { Icon } from './Icon';

export function Toaster() {
  const toast = useStore((s) => s.toast);
  const dismiss = useStore((s) => s.dismissToast);
  if (!toast) return null;
  return (
    <div className="tz-toast" role="status" aria-live="polite">
      <Icon name={toast.kind === 'error' ? 'close' : 'check'} size={14} color="var(--tz-accent)" />
      <span>{toast.message}</span>
      <button
        onClick={dismiss}
        style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0, marginLeft: 4 }}
        aria-label="Dismiss"
      >
        <Icon name="close" size={12} />
      </button>
    </div>
  );
}
