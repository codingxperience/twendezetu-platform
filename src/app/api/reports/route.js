import { route } from '@/server/http';
import { schemas } from '@/server/schemas';
import { fileReport } from '@/server/services/moderation';

export const POST = route({ auth: 'required', body: schemas.report, limit: [{ policy: 'report', by: 'user' }] }, async ({ body, viewer }) => fileReport(viewer, body));
