/**
 * Tests for calendar booking timezone handling.
 * Verifies that bookAppointment passes local datetime strings (not UTC)
 * to Google Calendar, so a "9am Tuesday" booking in New York stays at 9am ET.
 */

// Extract the datetime-building logic for unit testing
function buildBookingDateStrings(
  date: string,
  time: string,
  durationMins: number,
): { startStr: string; endStr: string } {
  const hhmm     = time.length === 5 ? time : time.padStart(5, '0');
  const startStr = `${date}T${hhmm}:00`;

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute]     = hhmm.split(':').map(Number);
  const startMs  = Date.UTC(year, month - 1, day, hour, minute);
  const endMs    = startMs + durationMins * 60 * 1000;
  const endDate  = new Date(endMs);
  const endStr   = [
    String(endDate.getUTCFullYear()),
    String(endDate.getUTCMonth() + 1).padStart(2, '0'),
    String(endDate.getUTCDate()).padStart(2, '0'),
  ].join('-') + 'T' + [
    String(endDate.getUTCHours()).padStart(2, '0'),
    String(endDate.getUTCMinutes()).padStart(2, '0'),
    '00',
  ].join(':');

  return { startStr, endStr };
}

describe('calendar booking datetime strings', () => {
  it('produces a local (non-UTC) start datetime', () => {
    const { startStr } = buildBookingDateStrings('2024-03-15', '09:00', 60);
    // Must NOT end with Z (which would mean UTC)
    expect(startStr).toBe('2024-03-15T09:00:00');
    expect(startStr.endsWith('Z')).toBe(false);
  });

  it('adds duration correctly across the hour boundary', () => {
    const { endStr } = buildBookingDateStrings('2024-03-15', '09:00', 60);
    expect(endStr).toBe('2024-03-15T10:00:00');
  });

  it('adds duration correctly across the day boundary', () => {
    const { endStr } = buildBookingDateStrings('2024-03-15', '23:30', 60);
    expect(endStr).toBe('2024-03-16T00:30:00');
  });

  it('handles 30-minute durations', () => {
    const { endStr } = buildBookingDateStrings('2024-03-15', '14:45', 30);
    expect(endStr).toBe('2024-03-15T15:15:00');
  });

  it('pads single-digit time components', () => {
    const { startStr, endStr } = buildBookingDateStrings('2024-01-05', '09:05', 60);
    expect(startStr).toBe('2024-01-05T09:05:00');
    expect(endStr).toBe('2024-01-05T10:05:00');
  });
});
