import { eventConfig as e } from '../config/eventConfig';
const escape = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
const utc = (date: string) =>
  new Date(date)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
// RFC 5545: fold at 75 UTF-8 octets, without splitting multi-byte characters.
const fold = (line: string) => {
  let result = '',
    length = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (length + size > 75) {
      result += '\r\n ';
      length = 1;
    }
    result += char;
    length += size;
  }
  return result;
};
export function createCalendar() {
  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nash Vechir//Birthday Invitation//UK',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${e.id}@nash-vechir.local`,
      `DTSTAMP:${utc(new Date().toISOString())}`,
      `DTSTART:${utc(e.startsAt)}`,
      `DTEND:${utc(e.endsAt)}`,
      `SUMMARY:${escape(e.title)}`,
      `LOCATION:${escape(e.addressVerified && e.address ? `${e.venue}, ${e.address}` : `${e.city} — локацію повідомимо окремо`)}`,
      `DESCRIPTION:${escape(`${e.meetingNote}\nДрес-код: ${e.dressCode}. ${e.dressCodeNote}`)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .map(fold)
      .join('\r\n') + '\r\n'
  );
}
export function downloadCalendar() {
  const url = URL.createObjectURL(
    new Blob([createCalendar()], { type: 'text/calendar;charset=utf-8' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `${e.id}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
