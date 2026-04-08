/**
 * Разбор и нормализация календарных дат из API (DateOnly как YYYY-MM-DD).
 */

export function parseDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
