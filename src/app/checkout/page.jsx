import { ClaudeDesignPage } from '@/components/ClaudeDesignPage';

export default async function CheckoutPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const eventSlug = typeof sp.event === 'string' ? sp.event : null;
  return <ClaudeDesignPage page="checkout" initialState={eventSlug ? { eventSlug } : {}} />;
}
