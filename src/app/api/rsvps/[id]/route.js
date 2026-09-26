import { route, withStatus } from '@/server/http';
import { schemas } from '@/server/schemas';
import { cancelRsvp, setCalendarAdded, setReminderPlan } from '@/server/services/rsvps';

export const PATCH = route({ auth: 'required', body: schemas.rsvpUpdate }, async ({ body, viewer, params }) => {
  const result = {};
  if (body.reminderPlan) Object.assign(result, await setReminderPlan(viewer, params.id, body.reminderPlan));
  if (body.calendarAdded !== undefined) Object.assign(result, await setCalendarAdded(viewer, params.id, body.calendarAdded));
  return result;
});

export const DELETE = route({ auth: 'required' }, async ({ viewer, params }) => withStatus(200, await cancelRsvp({ rsvpId: params.id, viewer })));
