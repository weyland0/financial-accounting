/**
 * Префикс статуса транзакции, создаваемой при оплате инвойса.
 * Должен совпадать с TransactionStatuses.InvoicePaymentPrefix на бэкенде.
 */
export const INVOICE_PAYMENT_STATUS_PREFIX = 'Оплата счета #';

/**
 * Возвращает true, если транзакция является служебной оплатой инвойса.
 * Используется в P&L для исключения двойного счёта (инвойс уже учтён по начислению).
 */
export function isInvoicePaymentTransaction(tx) {
  const s = tx?.status || '';
  return s.toLowerCase().startsWith(INVOICE_PAYMENT_STATUS_PREFIX.toLowerCase());
}
