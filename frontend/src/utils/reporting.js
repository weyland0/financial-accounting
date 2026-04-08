/**
 * Расчёты для отчётности по периоду: начисленный P&L, денежный поток, сводка за календарный месяц.
 */

import { classifyExpenseCategory } from './expenseCategories';
import { summarizeUnpaidInvoices } from './invoices';
import { parseDateOnly } from './dates';
import { isInvoicePaymentTransaction } from './transactions';
import { sumAccountBalances } from './accounts';

export function computeAccrualPnLForRange(
  transactions,
  invoices,
  categoryById,
  from,
  to,
) {
  let revenue = 0;
  let cogs = 0;
  let opex = 0;
  const inRange = (d) => d && d >= from && d <= to;

  for (const inv of invoices) {
    const d = parseDateOnly(inv.invoiceDate);
    if (!inRange(d)) continue;
    const cat = categoryById.get(inv.categoryId);
    if (inv.invoiceType === 'INCOME') {
      revenue += Number(inv.amount || 0);
    } else if (inv.invoiceType === 'EXPENSE') {
      const bucket = classifyExpenseCategory(cat);
      if (bucket === 'COGS') cogs += Number(inv.amount || 0);
      else opex += Number(inv.amount || 0);
    }
  }

  for (const tx of transactions) {
    if (isInvoicePaymentTransaction(tx)) continue;
    const d = parseDateOnly(tx.transactionDate);
    if (!inRange(d)) continue;
    const cat = categoryById.get(tx.categoryId);
    if (tx.transactionType === 'INCOME') {
      revenue += Number(tx.amount || 0);
    } else if (tx.transactionType === 'EXPENSE') {
      const bucket = classifyExpenseCategory(cat);
      if (bucket === 'COGS') cogs += Number(tx.amount || 0);
      else opex += Number(tx.amount || 0);
    }
  }

  const net = revenue - cogs - opex;
  return { revenue, cogs, opex, net };
}

/** Факт движения денег: все операции в периоде (включая оплаты счетов). */
export function computeCashMovementForRange(transactions, from, to) {
  let income = 0;
  let expense = 0;
  const inRange = (d) => d && d >= from && d <= to;

  for (const tx of transactions) {
    const d = parseDateOnly(tx.transactionDate);
    if (!inRange(d)) continue;
    if (tx.transactionType === 'INCOME') {
      income += Number(tx.amount || 0);
    } else if (tx.transactionType === 'EXPENSE') {
      expense += Number(tx.amount || 0);
    }
  }

  return { income, expense, net: income - expense };
}

/**
 * Сводные показатели за календарный месяц `today` (остатки счетов, P&L, кэш, неоплаченные счета).
 */
export function aggregateCalendarMonthFinancials({
  transactions,
  invoices,
  accounts,
  categoryById,
  today = new Date(),
}) {
  const y = today.getFullYear();
  const m = today.getMonth();
  const from = new Date(y, m, 1);
  const to = new Date(y, m + 1, 0);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const pnlMonth = computeAccrualPnLForRange(
    transactions,
    invoices,
    categoryById,
    from,
    to,
  );
  const cashMonth = computeCashMovementForRange(transactions, from, to);
  const unpaid = summarizeUnpaidInvoices(invoices, today);
  const totalLiquidity = sumAccountBalances(accounts);

  return {
    monthLabel: from.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
    }),
    totalLiquidity,
    pnlMonth,
    cashMonth,
    unpaid,
  };
}
