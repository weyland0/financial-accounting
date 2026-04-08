/**
 * Классификация статей учёта для P&L (себестоимость vs операционные расходы).
 */

export function classifyExpenseCategory(category) {
  const t = (category?.activityType || '').toLowerCase();
  if (
    t.includes('cogs') ||
    t.includes('себестоим') ||
    t.includes('сырь') ||
    t.includes('материал')
  ) {
    return 'COGS';
  }
  return 'OPEX';
}
