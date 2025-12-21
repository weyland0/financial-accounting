import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactionsByOrganization } from '../services/transactionService';
import { getCategoriesByOrganization } from '../services/categoryService';
import { activityTypeLabels } from '../config/enums'
import '../styles/CashFlow.css';

function toDateOnlyString(d) {
  return d.toISOString().split('T')[0];
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

function periodKey(date, granularity) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  if (granularity === 'month') return `${y}-${String(m).padStart(2, '0')}`;
  if (granularity === 'quarter') return `${y}-Q${Math.floor((m - 1) / 3) + 1}`;
  if (granularity === 'half') return `${y}-H${m <= 6 ? 1 : 2}`;
  return `${y}`; // year
}

function periodLabel(key, granularity) {
  if (granularity === 'month') return key;
  return key;
}

function isInvoicePaymentTransaction(tx) {
  const s = (tx?.status || '').toLowerCase();
  return s.startsWith('оплата счета #');
}

function normalizeActivityType(activityType) {
  // Приводим к стандартным значениям для группировки
  const t = (activityType || '').toUpperCase().trim();
  if (t === 'OPERATING' || t === 'ADMINISTRATIVE' || t === 'MARKETING' || t === 'COGS') {
    return 'OPERATING';
  }
  if (t === 'INVESTING') return 'INVESTING';
  if (t === 'FINANCIAL') return 'FINANCIAL';
  return 'OPERATING'; // По умолчанию операционная
}

export function CashFlow() {
  const { user, loading } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const [granularity, setGranularity] = useState('month'); // month|quarter|half|year

  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth() - 11, 1); // 12 месяцев
  const [fromDate, setFromDate] = useState(toDateOnlyString(defaultFrom));
  const [toDate, setToDate] = useState(toDateOnlyString(today));

  useEffect(() => {
    const load = async () => {
      if (!user?.organizationId) return;
      try {
        setError(null);
        const [txs, cats] = await Promise.all([
          getTransactionsByOrganization(user.organizationId),
          getCategoriesByOrganization(user.organizationId)
        ]);
        setTransactions(txs);
        setCategories(cats);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных отчёта');
      }
    };
    load();
  }, [user?.organizationId]);

  const categoryById = useMemo(() => {
    const m = new Map();
    for (const c of categories) {
      m.set(c.id, c);
    }
    return m;
  }, [categories]);

  const periods = useMemo(() => {
    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    if (!from || !to) return [];
    const out = [];
    const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);

    const seen = new Set();
    while (cursor <= end) {
      const key = periodKey(cursor, granularity);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(key);
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return out;
  }, [fromDate, toDate, granularity]);

  const cashFlow = useMemo(() => {
    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    if (!from || !to) {
      return null;
    }

    // База: periods -> значения
    const initSeries = () => Object.fromEntries(periods.map(p => [p, 0]));

    // Начальный баланс (одинаковый для всех периодов - баланс на начало первого периода)
    let beginningBalanceValue = 0;
    
    // По периодам: activityType -> { income, expense }
    const operatingIncome = initSeries();
    const operatingExpense = initSeries();
    const investingIncome = initSeries();
    const investingExpense = initSeries();
    const financialIncome = initSeries();
    const financialExpense = initSeries();

    const addTo = (series, key, amount) => {
      if (!(key in series)) return;
      series[key] += Number(amount || 0);
    };

    const inRange = (d) => d >= from && d <= to;
    const beforeRange = (d) => d < from;

    // Фильтруем транзакции (исключаем оплаты счетов)
    const validTransactions = transactions.filter(tx => !isInvoicePaymentTransaction(tx));

    // 1) Рассчитываем начальный баланс (все транзакции до начала периода)
    for (const tx of validTransactions) {
      const d = parseDate(tx.transactionDate);
      if (!d || !beforeRange(d)) continue;
      
      const amount = Number(tx.amount || 0);
      if (tx.transactionType === 'INCOME') {
        beginningBalanceValue += amount;
      } else if (tx.transactionType === 'EXPENSE') {
        beginningBalanceValue -= amount;
      }
    }

    // Создаем серию с одинаковым начальным балансом для всех периодов
    const beginningBalance = initSeries();
    for (const p of periods) {
      beginningBalance[p] = beginningBalanceValue;
    }

    // 2) Рассчитываем движение по периодам и активностям
    for (const tx of validTransactions) {
      const d = parseDate(tx.transactionDate);
      if (!d || !inRange(d)) continue;
      
      const key = periodKey(d, granularity);
      const cat = categoryById.get(tx.categoryId);
      const activityType = normalizeActivityType(cat?.activityType);
      const amount = Number(tx.amount || 0);

      if (tx.transactionType === 'INCOME') {
        if (activityType === 'OPERATING') addTo(operatingIncome, key, amount);
        else if (activityType === 'INVESTING') addTo(investingIncome, key, amount);
        else if (activityType === 'FINANCIAL') addTo(financialIncome, key, amount);
      } else if (tx.transactionType === 'EXPENSE') {
        if (activityType === 'OPERATING') addTo(operatingExpense, key, amount);
        else if (activityType === 'INVESTING') addTo(investingExpense, key, amount);
        else if (activityType === 'FINANCIAL') addTo(financialExpense, key, amount);
      }
    }

    // Изменения за период (сумма всех активностей)
    const periodChange = initSeries();
    for (const p of periods) {
      const operating = (operatingIncome[p] || 0) - (operatingExpense[p] || 0);
      const investing = (investingIncome[p] || 0) - (investingExpense[p] || 0);
      const financial = (financialIncome[p] || 0) - (financialExpense[p] || 0);
      periodChange[p] = operating + investing + financial;
    }

    // Конечный баланс = начальный + накопленные изменения
    const endingBalance = initSeries();
    let accumulated = beginningBalanceValue;
    for (const p of periods) {
      accumulated += periodChange[p];
      endingBalance[p] = accumulated;
    }

    return {
      beginningBalance,
      operating: { income: operatingIncome, expense: operatingExpense },
      investing: { income: investingIncome, expense: investingExpense },
      financial: { income: financialIncome, expense: financialExpense },
      periodChange,
      endingBalance
    };
  }, [fromDate, toDate, granularity, periods, transactions, categoryById]);

  const formatMoney = (v) => Number(v || 0).toFixed(2);

  if (loading) {
    return (
      <div className="cashflow-loading">
        <div className="loading-spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="cashflow-container">
        <div className="cashflow-empty">
          <h2>Организация не выбрана</h2>
          <p>Создайте или выберите организацию, чтобы открыть отчёты.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cashflow-container">
      <div className="cashflow-header">
        <div>
          <h1>Отчёт о движении денежных средств (Cash Flow)</h1>
          <p>Данные из операций (транзакций), исключая оплаты счетов</p>
        </div>
      </div>

      {error && (
        <div className="cashflow-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="cashflow-filters">
        <select value={granularity} onChange={e => setGranularity(e.target.value)}>
          <option value="month">Месяцы</option>
          <option value="quarter">Кварталы</option>
          <option value="half">Полугодия</option>
          <option value="year">Годы</option>
        </select>

        <div className="date-range">
          <label>
            C
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </label>
          <label>
            По
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="cashflow-table-wrapper">
        <table className="cashflow-table">
          <thead>
            <tr>
              <th>Показатель</th>
              {periods.map(p => (
                <th key={p}>{periodLabel(p, granularity)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!cashFlow ? (
              <tr>
                <td colSpan={1 + periods.length} className="empty-row">Нет данных</td>
              </tr>
            ) : (
              <>
                <tr className="row-main">
                  <td>Деньги на начало периода</td>
                  {periods.map(p => (
                    <td key={p} className="amount">{formatMoney(cashFlow.beginningBalance[p])}</td>
                  ))}
                </tr>

                <tr className="row-section">
                  <td>{activityTypeLabels.operating || 'Операционная деятельность'}</td>
                  {periods.map(p => <td key={p}></td>)}
                </tr>
                <tr className="row-child">
                  <td className="child-label">↳ Поступления</td>
                  {periods.map(p => (
                    <td key={p} className="amount income">{formatMoney(cashFlow.operating.income[p])}</td>
                  ))}
                </tr>
                <tr className="row-child">
                  <td className="child-label">↳ Списания</td>
                  {periods.map(p => (
                    <td key={p} className="amount expense">{formatMoney(cashFlow.operating.expense[p])}</td>
                  ))}
                </tr>

                <tr className="row-section">
                  <td>{activityTypeLabels.investing || 'Инвестиционная деятельность'}</td>
                  {periods.map(p => <td key={p}></td>)}
                </tr>
                <tr className="row-child">
                  <td className="child-label">↳ Поступления</td>
                  {periods.map(p => (
                    <td key={p} className="amount income">{formatMoney(cashFlow.investing.income[p])}</td>
                  ))}
                </tr>
                <tr className="row-child">
                  <td className="child-label">↳ Списания</td>
                  {periods.map(p => (
                    <td key={p} className="amount expense">{formatMoney(cashFlow.investing.expense[p])}</td>
                  ))}
                </tr>

                <tr className="row-section">
                  <td>{activityTypeLabels.financial || 'Финансовая деятельность'}</td>
                  {periods.map(p => <td key={p}></td>)}
                </tr>
                <tr className="row-child">
                  <td className="child-label">↳ Поступления</td>
                  {periods.map(p => (
                    <td key={p} className="amount income">{formatMoney(cashFlow.financial.income[p])}</td>
                  ))}
                </tr>
                <tr className="row-child">
                  <td className="child-label">↳ Списания</td>
                  {periods.map(p => (
                    <td key={p} className="amount expense">{formatMoney(cashFlow.financial.expense[p])}</td>
                  ))}
                </tr>

                <tr className="row-main">
                  <td>Изменения денег за период</td>
                  {periods.map(p => (
                    <td key={p} className="amount">{formatMoney(cashFlow.periodChange[p])}</td>
                  ))}
                </tr>

                <tr className="row-main">
                  <td>Деньги на конец периода</td>
                  {periods.map(p => (
                    <td key={p} className="amount">{formatMoney(cashFlow.endingBalance[p])}</td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

