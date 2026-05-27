'use client';

import useSWR, { mutate as globalMutate } from 'swr';
import { fetcher } from './api-client';

const KEYS = {
  me: '/api/auth/me',
  favorites: '/api/favorites',
  bookings: '/api/bookings',
  inquiries: '/api/inquiries',
};

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR(KEYS.me, fetcher, { revalidateOnFocus: false });
  return { user: data?.user || null, error, isLoading, refresh: mutate };
}

export function useFavorites() {
  const { data, error, isLoading, mutate } = useSWR(KEYS.favorites, fetcher);
  return { favorites: data?.favorites || [], error, isLoading, refresh: mutate };
}

export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR(KEYS.bookings, fetcher);
  return { bookings: data?.bookings || [], error, isLoading, refresh: mutate };
}

export function useBooking(id) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/bookings/${id}` : null, fetcher, { refreshInterval: 0 });
  return { booking: data?.booking || null, error, isLoading, refresh: mutate };
}

export function useInquiries() {
  const { data, error, isLoading, mutate } = useSWR(KEYS.inquiries, fetcher);
  return { inquiries: data?.inquiries || [], error, isLoading, refresh: mutate };
}

export function useVendors(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  const key = `/api/vendors${qs.toString() ? '?' + qs.toString() : ''}`;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher);
  return { vendors: data?.vendors || [], error, isLoading, refresh: mutate };
}

export function useVendor(slug) {
  const { data, error, isLoading, mutate } = useSWR(slug ? `/api/vendors/${slug}` : null, fetcher);
  return { vendor: data?.vendor || null, error, isLoading, refresh: mutate };
}

export function refreshAll() {
  return Promise.all(Object.values(KEYS).map((k) => globalMutate(k)));
}
