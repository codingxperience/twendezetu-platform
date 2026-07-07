import { ClaudeDesignPage } from '@/components/ClaudeDesignPage';

export default async function SettingsPage({ searchParams }) {
  const params = await searchParams;
  const role = params?.role === 'provider' ? 'provider' : 'user';
  const fields = role === 'provider'
    ? { name: 'Ssemakula Kato', biz: 'Kato 4x4 & Tours', email: 'kato@gmail.com', phone: '+256 7** *** 214' }
    : undefined;

  return <ClaudeDesignPage page="settings" initialState={{ role, ...(fields ? { fields } : {}) }} />;
}
