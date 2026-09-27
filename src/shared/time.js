// Wall-clock times in a named time zone. Event times are entered as the
// venue's local time ("2026-08-08T14:00" in Africa/Nairobi) and stored as
// UTC instants; these helpers convert both ways, daylight saving included.

function zoneParts(timestamp, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(timestamp))
      .map((part) => [part.type, part.value]),
  );
  return { year: +parts.year, month: +parts.month, day: +parts.day, hour: +parts.hour, minute: +parts.minute, second: +parts.second };
}

// How far the zone's wall clock is ahead of UTC at that instant, in ms.
function offsetAt(timestamp, timeZone) {
  const p = zoneParts(timestamp, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(timestamp / 1000) * 1000;
}

// "2026-08-08T14:00" read as a wall-clock time in `timeZone` → Date (UTC).
export function fromZonedInput(local, timeZone) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(local || ''));
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  // Around a daylight-saving change the zone has two offsets. Prefer the
  // earlier one that reproduces the wall time (the first 01:30 when clocks go
  // back); when neither does, the time falls in the skipped hour and moves
  // forward by it (02:30 becomes 03:30), as calendar apps do.
  const before = wall - offsetAt(wall - 12 * 3_600_000, timeZone);
  const after = wall - offsetAt(wall + 12 * 3_600_000, timeZone);
  const matches = (utc) => toZonedInput(new Date(utc), timeZone) === local;
  if (matches(before)) return new Date(before);
  if (matches(after)) return new Date(after);
  return new Date(before);
}

// Date → "2026-08-08T14:00" as the wall clock reads in `timeZone`.
export function toZonedInput(date, timeZone) {
  if (!date) return '';
  const p = zoneParts(new Date(date).getTime(), timeZone);
  const pad = (value) => String(value).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}
