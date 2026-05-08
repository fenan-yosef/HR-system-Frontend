
export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getDateKey(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad(hours)}h ${pad(minutes)}m`;
}

export function differenceInMinutes(start: Date, end: Date) {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
}

export function getWeekDates(referenceDate: Date) {
  const current = new Date(referenceDate);
  const day = current.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setUTCDate(current.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    return date;
  });
}
