import { route } from '@/server/http';
import { exportPersonalData } from '@/server/services/identity';

export const GET = route({ auth: 'required', limit: [{ policy: 'auth.password', by: 'user' }] }, async ({ viewer }) => {
  const data = await exportPersonalData(viewer.id);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="twendezetu-${viewer.handle}-data.json"`,
      'cache-control': 'no-store',
    },
  });
});
