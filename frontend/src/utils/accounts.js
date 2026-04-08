/**
 * Агрегаты по банковским/учётным счетам организации (как в AccountResponse.balance).
 */

export function sumAccountBalances(accounts) {
  if (!Array.isArray(accounts)) return 0;
  return accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
}
