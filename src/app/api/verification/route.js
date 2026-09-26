import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { saveSection, submitApplication, verificationState } from '@/server/services/verification';

export const GET = route({ auth: 'required' }, async ({ viewer }) => verificationState(viewer));

export const PATCH = route({ auth: 'required', body: schemas.verificationSection }, async ({ body, viewer }) => saveSection(viewer, body.section, body.fields));

export const POST = route({ auth: 'required' }, async ({ viewer }) => withStatus(200, await submitApplication(viewer)));
