/**
 * Бизнес-правила по счетам (инвойсам): остаток, сроки, просрочка, агрегаты и фильтры.
 */

import { parseDateOnly, startOfDay } from './dates';

const REMAINING_EPS = 0.005;

export function invoiceRemaining(inv) {
  return Math.max(
    0,
    Number(inv.amount || 0) - Number(inv.paidAmount || 0),
  );
}

export function isInvoiceOpen(inv) {
  return invoiceRemaining(inv) > REMAINING_EPS;
}

/**
 * paid | overdue | due_soon | open
 * due_soon — срок в ближайшие upcomingDays дней (включая сегодня), без просрочки
 */
export function getInvoiceDueBucket(
  inv,
  now = new Date(),
  upcomingDays = 7,
) {
  if (!isInvoiceOpen(inv)) return 'paid';
  const due = parseDateOnly(inv.payUpDate);
  if (!due) return 'open';

  const today = startOfDay(now);
  const dueDay = startOfDay(due);

  if (dueDay < today) return 'overdue';

  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + upcomingDays);
  if (dueDay <= horizon) return 'due_soon';

  return 'open';
}

export function overdueDaysCount(inv, now = new Date()) {
  if (getInvoiceDueBucket(inv, now) !== 'overdue') return 0;
  const due = parseDateOnly(inv.payUpDate);
  if (!due) return 0;
  const today = startOfDay(now);
  const dueDay = startOfDay(due);
  return Math.max(
    1,
    Math.round((today - dueDay) / (24 * 60 * 60 * 1000)),
  );
}

/** Агрегаты по открытым счетам и окнам срока (как в getInvoiceDueBucket). */
export function summarizeDueInvoices(
  invoices,
  now = new Date(),
  upcomingDays = 7,
) {
  let overdueCount = 0;
  let overdueSum = 0;
  let upcomingCount = 0;
  let upcomingSum = 0;
  let openCount = 0;
  let openSum = 0;

  for (const inv of invoices) {
    if (!isInvoiceOpen(inv)) continue;
    const rem = invoiceRemaining(inv);
    openCount += 1;
    openSum += rem;

    const bucket = getInvoiceDueBucket(inv, now, upcomingDays);
    if (bucket === 'overdue') {
      overdueCount += 1;
      overdueSum += rem;
    } else if (bucket === 'due_soon') {
      upcomingCount += 1;
      upcomingSum += rem;
    }
  }

  return {
    openCount,
    openSum,
    overdueCount,
    overdueSum,
    upcomingCount,
    upcomingSum,
  };
}

/** Неоплаченные остатки; просрочка считается так же, как в getInvoiceDueBucket. */
export function summarizeUnpaidInvoices(invoices, today = new Date()) {
  let overdueCount = 0;
  let overdueAmount = 0;
  let openCount = 0;
  let openAmount = 0;

  for (const inv of invoices) {
    if (!isInvoiceOpen(inv)) continue;
    const rem = invoiceRemaining(inv);
    openCount += 1;
    openAmount += rem;
    if (getInvoiceDueBucket(inv, today) === 'overdue') {
      overdueCount += 1;
      overdueAmount += rem;
    }
  }

  return {
    openCount,
    openAmount,
    overdueCount,
    overdueAmount,
  };
}

/**
 * Фильтр списков счетов по сроку.
 * filterKey: ALL | UNPAID | OVERDUE | UPCOMING_WEEK | ATTENTION
 */
export function matchesDueFilter(
  inv,
  filterKey,
  now = new Date(),
  upcomingDays = 7,
) {
  if (filterKey === 'ALL') return true;

  if (filterKey === 'UNPAID') {
    return isInvoiceOpen(inv);
  }

  if (filterKey === 'OVERDUE') {
    return getInvoiceDueBucket(inv, now, upcomingDays) === 'overdue';
  }

  if (filterKey === 'UPCOMING_WEEK') {
    const b = getInvoiceDueBucket(inv, now, upcomingDays);
    return isInvoiceOpen(inv) && b === 'due_soon';
  }

  if (filterKey === 'ATTENTION') {
    const b = getInvoiceDueBucket(inv, now, upcomingDays);
    return b === 'overdue' || b === 'due_soon';
  }

  return true;
}
