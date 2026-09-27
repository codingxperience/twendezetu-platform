import { route, withStatus } from '@/server/http';
import { listSessions, revokeAllSessions } from '@/server/security/sessions';

export const GET = route({ auth: 'required' }, async ({ viewer, session }) => {
  const sessions = await listSessions(viewer.id);
  return { sessions: sessions.map((row) => ({ ...row, current: row.id === session.id })) };
});

// Signs out every other device.
export const DELETE = route({ auth: 'required' }, async ({ viewer, session }) =>
  withStatus(200, { signedOut: await revokeAllSessions(viewer.id, { exceptSessionId: session.id }) }));
