import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactionsByOrganization } from '../services/transactionService';
import { getAllAccountsByOrganization } from '../services/accountService';
import { getCategoriesByOrganization } from '../services/categoryService';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import '../styles/Transactions.css';

export function Transactions() {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // После отрисовки компонента выполним запрос к бекэнду (как побочный эффект), чтобы получить
  // все транзакции, все счета и все категории учета.
  // Хук запускается как только значение user.organizationId изменяется 
  useEffect(() => {
    const loadData = async () => {
      if (!user?.organizationId)
        return;
      try {
        setError(null);
        const [txs, accs, cats] = await Promise.all([
          getTransactionsByOrganization(user.organizationId),
          getAllAccountsByOrganization(user.organizationId),
          getCategoriesByOrganization(user.organizationId)
        ]);
        setTransactions(txs);
        setAccounts(accs);
        setCategories(cats);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
      }
    };
    loadData();
  }, [user?.organizationId]);

  const handleCreated = (tx) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filterType !== 'ALL') {
      list = list.filter(t => t.transactionType === filterType);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(t =>
        (t.counterparty || '').toLowerCase().includes(s) ||
        (t.categoryName || '').toLowerCase().includes(s) ||
        (t.status || '').toLowerCase().includes(s)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.transactionDate) - new Date(b.transactionDate);
      } else if (sortField === 'amount') {
        cmp = a.amount - b.amount;
      } else if (sortField === 'status') {
        cmp = (a.status || '').localeCompare(b.status || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [transactions, filterType, search, sortField, sortDir]);

  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.transactionType === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = transactions
      .filter(t => t.transactionType === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  if (loading) {
    return (
      <div className="transactions-loading">
        <div className="loading-spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="transactions-container">
        <div className="transactions-empty">
          <h2>Организация не выбрана</h2>
          <p>Создайте или выберите организацию, чтобы работать с операциями.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <div>
          <h1>Операции</h1>
          <p>Доходы и расходы вашей организации</p>
        </div>
        <div className="actions">
          <button className="btn-income" onClick={() => setShowIncomeModal(true)}>
            ➕ Добавить доход
          </button>
          <button className="btn-expense" onClick={() => setShowExpenseModal(true)}>
            ➖ Добавить расход
          </button>
        </div>
      </div>

      {error && (
        <div className="transactions-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="transactions-stats">
        <div className="stat-card income">
          <p>Поступления</p>
          <h3>{totals.income.toFixed(2)}</h3>
        </div>
        <div className="stat-card expense">
          <p>Расходы</p>
          <h3>{totals.expense.toFixed(2)}</h3>
        </div>
        <div className="stat-card balance">
          <p>Сальдо</p>
          <h3>{totals.balance.toFixed(2)}</h3>
        </div>
      </div>

      <div className="transactions-filters">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="ALL">Все</option>
          <option value="INCOME">Доходы</option>
          <option value="EXPENSE">Расходы</option>
        </select>

        <select value={sortField} onChange={e => setSortField(e.target.value)}>
          <option value="date">Дата</option>
          <option value="amount">Сумма</option>
          <option value="status">Статус</option>
        </select>

        <select value={sortDir} onChange={e => setSortDir(e.target.value)}>
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>

        <input
          type="text"
          placeholder="Поиск по контрагенту/статье/статусу"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="transactions-table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th>Контрагент</th>
              <th>Статья учета</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">Нет операций</td>
              </tr>
            ) : filtered.map(tx => (
              <tr key={tx.id}>
                <td>{tx.transactionDate}</td>
                <td>{tx.status || '—'}</td>
                <td className={tx.transactionType === 'INCOME' ? 'amount income' : 'amount expense'}>
                  {tx.transactionType === 'INCOME' ? '+' : '-'}{Number(tx.amount).toFixed(2)}
                </td>
                <td>{tx.counterparty || '—'}</td>
                <td>{tx.categoryName || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateTransactionModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onCreated={handleCreated}
        transactionType="INCOME"
        accounts={accounts}
        categories={categories}
        organizationId={user?.organizationId}
      />
      <CreateTransactionModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onCreated={handleCreated}
        transactionType="EXPENSE"
        accounts={accounts}
        categories={categories}
        organizationId={user?.organizationId}
      />
    </div>
  );
}

