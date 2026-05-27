'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// UI-only zustand store. Server data (auth, bookings, favorites, etc.) lives
// in the database and is fetched via SWR — see src/lib/swr.js. The persisted
// slice here is only locale preferences and the in-flight booking draft.

export const useStore = create()(
  persist(
    (set) => ({
      currency: 'KES',
      language: 'en-sw',
      theme: 'savanna',
      setLocale: (patch) => set((s) => ({ ...s, ...patch })),

      // In-progress booking draft (kept locally so reload doesn't drop it)
      bookingDraft: null,
      startBooking: ({ vendorId, packageId, contactName }) => {
        const eventDate = new Date();
        eventDate.setMonth(eventDate.getMonth() + 2);
        set({
          bookingDraft: {
            vendorId,
            packageId,
            eventDate: eventDate.toISOString().slice(0, 10),
            guests: 120,
            contactName: contactName || '',
            contactPhone: '',
            notes: '',
            addOns: [],
            step: 1,
          },
        });
      },
      updateDraft: (patch) => set((s) => ({ bookingDraft: s.bookingDraft ? { ...s.bookingDraft, ...patch } : null })),
      clearDraft: () => set({ bookingDraft: null }),

      // Toast queue (transient, not persisted)
      toast: null,
      showToast: (message, kind = 'info') => {
        const ts = Date.now();
        set({ toast: { message, kind, ts } });
        setTimeout(() => {
          const cur = useStore.getState().toast;
          if (cur?.ts === ts) set({ toast: null });
        }, 3000);
      },
      dismissToast: () => set({ toast: null }),
    }),
    {
      name: 'twendezetu-ui-v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : null)),
      partialize: (s) => ({
        currency: s.currency,
        language: s.language,
        theme: s.theme,
        bookingDraft: s.bookingDraft,
      }),
    },
  ),
);

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  return hydrated;
}
