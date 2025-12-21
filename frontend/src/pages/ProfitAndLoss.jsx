import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactionsByOrganization } from '../services/transactionService';
import { getInvoicesByOrganization } from '../services/invoiceService';
import { getCategoriesByOrganization } from '../services/categoryService';
import '../styles/ProfitAndLoss.css';

function toDateOnlyString(d) {
  return d.toISOString().split('T')[0];
}

function parseDate(value) {
  // value приходит как YYYY-MM-DD (DateOnly сериализован строкой)
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
  // В InvoiceService мы создаем транзакцию со Status = "Оплата счета #<id>"
  const s = (tx?.status || '').toLowerCase();
  return s.startsWith('оплата счета #');
}

function classifyExpenseCategory(category) {
  // ActivityType у вас сейчас свободным текстом. Делаем безопасную классификацию:
  // - если явно похоже на себестоимость/COGS -> COGS
  // - иначе расходы считаем OpEx
  const t = (category?.activityType || '').toLowerCase();
  if (t.includes('cogs') || t.includes('себестоим') || t.includes('сырь') || t.includes('материал')) {
    return 'COGS';
  }
  return 'OPEX';
}

export function ProfitAndLoss() {
  const { user, loading } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
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
        const [txs, invs, cats] = await Promise.all([
          getTransactionsByOrganization(user.organizationId),
          getInvoicesByOrganization(user.organizationId),
          getCategoriesByOrganization(user.organizationId)
        ]);
        setTransactions(txs);
        setInvoices(invs);
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
    // генерируем список периодов, чтобы таблица была стабильной
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

    // для year/half/quarter порядок по времени сохраняется, т.к. идём месяцами
    return out;
  }, [fromDate, toDate, granularity]);

  const pnl = useMemo(() => {
    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    if (!from || !to) {
      return null;
    }

    // База: periods -> значения
    const initSeries = () => Object.fromEntries(periods.map(p => [p, 0]));

    const revenueTotal = initSeries();
    const revenueByCategory = new Map(); // name -> series

    const cogsTotal = initSeries();
    const opexTotal = initSeries();

    const addTo = (series, key, amount) => {
      if (!(key in series)) return;
      series[key] += Number(amount || 0);
    };

    const addRevenueCategory = (categoryName, key, amount) => {
      const name = categoryName || '—';
      if (!revenueByCategory.has(name)) {
        revenueByCategory.set(name, initSeries());
      }
      addTo(revenueByCategory.get(name), key, amount);
    };

    const inRange = (d) => d >= from && d <= to;

    // 1) Invoices — начисление: учитываем ВСЕ, даже неоплаченные
    for (const inv of invoices) {
      const d = parseDate(inv.invoiceDate);
      if (!d || !inRange(d)) continue;
      const key = periodKey(d, granularity);
      const cat = categoryById.get(inv.categoryId);
      const catName = inv.categoryName || cat?.name;

      if (inv.invoiceType === 'INCOME') {
        addTo(revenueTotal, key, inv.amount);
        addRevenueCategory(catName, key, inv.amount);
      } else if (inv.invoiceType === 'EXPENSE') {
        const bucket = classifyExpenseCategory(cat);
        if (bucket === 'COGS') addTo(cogsTotal, key, inv.amount);
        else addTo(opexTotal, key, inv.amount);
      }
    }

    // 2) Transactions — добавляем “прочие” операции, исключая оплаты счетов (чтобы не задвоить начисление)
    for (const tx of transactions) {
      if (isInvoicePaymentTransaction(tx)) continue;
      const d = parseDate(tx.transactionDate);
      if (!d || !inRange(d)) continue;
      const key = periodKey(d, granularity);
      const cat = categoryById.get(tx.categoryId);
      const catName = tx.categoryName || cat?.name;

      if (tx.transactionType === 'INCOME') {
        addTo(revenueTotal, key, tx.amount);
        addRevenueCategory(catName, key, tx.amount);
      } else if (tx.transactionType === 'EXPENSE') {
        const bucket = classifyExpenseCategory(cat);
        if (bucket === 'COGS') addTo(cogsTotal, key, tx.amount);
        else addTo(opexTotal, key, tx.amount);
      }
    }

    const grossProfit = initSeries();
    const operatingProfit = initSeries();
    const netProfit = initSeries();

    for (const p of periods) {
      grossProfit[p] = revenueTotal[p] - cogsTotal[p];
      operatingProfit[p] = grossProfit[p] - opexTotal[p];
      netProfit[p] = operatingProfit[p];
    }

    // Рентабельности (в %)
    const grossMargin = initSeries();
    const operatingMargin = initSeries();
    const netMargin = initSeries();

    for (const p of periods) {
      const rev = revenueTotal[p] || 0;
      grossMargin[p] = rev ? (grossProfit[p] / rev) * 100 : 0;
      operatingMargin[p] = rev ? (operatingProfit[p] / rev) * 100 : 0;
      netMargin[p] = rev ? (netProfit[p] / rev) * 100 : 0;
    }

    // Упорядочим категории выручки по сумме за выбранный период
    const revenueCategoriesSorted = Array.from(revenueByCategory.entries())
      .map(([name, series]) => {
        const total = periods.reduce((s, p) => s + (series[p] || 0), 0);
        return { name, series, total };
      })
      .sort((a, b) => b.total - a.total);

    return {
      revenueTotal,
      revenueCategories: revenueCategoriesSorted,
      cogsTotal,
      grossProfit,
      opexTotal,
      operatingProfit,
      netProfit,
      margins: { grossMargin, operatingMargin, netMargin }
    };
  }, [fromDate, toDate, granularity, periods, invoices, transactions, categoryById]);

  const formatMoney = (v) => Number(v || 0).toFixed(2);
  const formatPct = (v) => `${Number(v || 0).toFixed(1)}%`;

  if (loading) {
    return (
      <div className="pnl-loading">
        <div className="loading-spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="pnl-container">
        <div className="pnl-empty">
          <h2>Организация не выбрана</h2>
          <p>Создайте или выберите организацию, чтобы открыть отчёты.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pnl-container">
      <div className="pnl-header">
        <div>
          <h1>Отчёт о прибылях и убытках (P&L)</h1>
          <p>Начисление: учитываем счета (включая неоплаченные) + прочие операции</p>
        </div>
      </div>

      {error && (
        <div className="pnl-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="pnl-filters">
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

      <div className="pnl-table-wrapper">
        <table className="pnl-table">
          <thead>
            <tr>
              <th>Показатель</th>
              {periods.map(p => (
                <th key={p}>{periodLabel(p, granularity)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!pnl ? (
              <tr>
                <td colSpan={1 + periods.length} className="empty-row">Нет данных</td>
              </tr>
            ) : (
              <>
                <tr className="row-main">
                  <td>Выручка</td>
                  {periods.map(p => <td key={p} className="amount income">{formatMoney(pnl.revenueTotal[p])}</td>)}
                </tr>
                {pnl.revenueCategories.map(cat => (
                  <tr key={cat.name} className="row-child">
                    <td className="child-label">↳ {cat.name}</td>
                    {periods.map(p => <td key={p} className="amount">{formatMoney(cat.series[p])}</td>)}
                  </tr>
                ))}

                <tr className="row-main">
                  <td>Себестоимость продаж (COGS)</td>
                  {periods.map(p => <td key={p} className="amount expense">{formatMoney(pnl.cogsTotal[p])}</td>)}
                </tr>

                <tr className="row-main">
                  <td>Валовая прибыль (Gross Profit)</td>
                  {periods.map(p => <td key={p} className="amount">{formatMoney(pnl.grossProfit[p])}</td>)}
                </tr>

                <tr className="row-main">
                  <td>Операционные расходы (OpEx)</td>
                  {periods.map(p => <td key={p} className="amount expense">{formatMoney(pnl.opexTotal[p])}</td>)}
                </tr>

                <tr className="row-main">
                  <td>Операционная прибыль (EBIT)</td>
                  {periods.map(p => <td key={p} className="amount">{formatMoney(pnl.operatingProfit[p])}</td>)}
                </tr>

                <tr className="row-main">
                  <td>Чистая прибыль</td>
                  {periods.map(p => <td key={p} className="amount">{formatMoney(pnl.netProfit[p])}</td>)}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {pnl && (
        <div className="pnl-margins">
          <div className="margin-card">
            <h3>Валовая маржа</h3>
            <div className="margin-grid">
              {periods.map(p => (
                <div key={p} className="margin-item">
                  <span className="k">{periodLabel(p, granularity)}</span>
                  <span className="v">{formatPct(pnl.margins.grossMargin[p])}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="margin-card">
            <h3>Операционная маржа</h3>
            <div className="margin-grid">
              {periods.map(p => (
                <div key={p} className="margin-item">
                  <span className="k">{periodLabel(p, granularity)}</span>
                  <span className="v">{formatPct(pnl.margins.operatingMargin[p])}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="margin-card">
            <h3>Чистая маржа</h3>
            <div className="margin-grid">
              {periods.map(p => (
                <div key={p} className="margin-item">
                  <span className="k">{periodLabel(p, granularity)}</span>
                  <span className="v">{formatPct(pnl.margins.netMargin[p])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


