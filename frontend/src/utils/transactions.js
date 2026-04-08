/**
 * Распознавание служебных операций (в т.ч. оплата счёта — не дублировать с инвойсами в начислении).
 */

export function isInvoicePaymentTransaction(tx) {
  const s = (tx?.status || '').toLowerCase();
  return s.startsWith('оплата счета #');
}
