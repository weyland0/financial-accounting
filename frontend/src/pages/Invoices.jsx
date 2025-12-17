import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInvoicesByOrganization } from '../services/invoiceService';
import { getAllAccountsByOrganization } from '../services/accountService';
import { getCategoriesByOrganization } from '../services/categoryService';
import { getCounterpartiesByOrganization } from '../services/counterpartyService';
import { CreateInvoiceModal } from '../components/CreateInvoiceModal';
import { PayInvoiceModal } from '../components/PayInvoiceModal';
import '../styles/Invoices.css';

export function Invoices() {
  const { user, loading } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [counterparties, setCounterparties] = useState([]);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.organizationId) return;
      try {
        setError(null);
        const [items, accs, cats, cps] = await Promise.all([
          getInvoicesByOrganization(user.organizationId),
          getAllAccountsByOrganization(user.organizationId),
          getCategoriesByOrganization(user.organizationId),
          getCounterpartiesByOrganization(user.organizationId)
        ]);
        setInvoices(items);
        setAccounts(accs);
        setCategories(cats);
        setCounterparties(cps);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки счетов');
      }
    };
    load();
  }, [user?.organizationId]);

  const handleCreated = (invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const handlePaid = (updated) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
  };

  const filtered = useMemo(() => {
    let list = [...invoices];

    if (typeFilter !== 'ALL') {
      list = list.filter(i => i.invoiceType === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      const s = statusFilter.toLowerCase();
      list = list.filter(i => (i.status || '').toLowerCase() === s);
    }

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(i =>
        (i.counterpartyName || '').toLowerCase().includes(s) ||
        (i.categoryName || '').toLowerCase().includes(s) ||
        (i.status || '').toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.invoiceDate) - new Date(b.invoiceDate);
      } else if (sortField === 'amount') {
        cmp = Number(a.amount) - Number(b.amount);
      } else if (sortField === 'status') {
        cmp = (a.status || '').localeCompare(b.status || '');
      } else if (sortField === 'counterparty') {
        cmp = (a.counterpartyName || '').localeCompare(b.counterpartyName || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [invoices, typeFilter, statusFilter, search, sortField, sortDir]);

  if (loading) {
    return (
      <div className="invoices-loading">
        <div className="loading-spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="invoices-container">
        <div className="invoices-empty">
          <h2>Организация не выбрана</h2>
          <p>Создайте или выберите организацию, чтобы работать со счетами.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoices-container">
      <div className="invoices-header">
        <div>
          <h1>Счета на оплату</h1>
          <p>Выставленные вашей организацией и для вашей организации</p>
        </div>
        <button className="btn-create-invoice" onClick={() => setShowCreateModal(true)}>
          ➕ Выставить счет
        </button>
      </div>

      {error && (
        <div className="invoices-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="invoices-filters">
        <input
          type="text"
          placeholder="Поиск по контрагенту, категории, статусу"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="ALL">Все типы</option>
          <option value="INCOME">Доход (контрагенту)</option>
          <option value="EXPENSE">Расход (организации)</option>
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">Все статусы</option>
          <option value="Оплачен">Оплачен</option>
          <option value="Оплачен частично">Оплачен частично</option>
          <option value="Не оплачен">Не оплачен</option>
        </select>

        <select value={sortField} onChange={e => setSortField(e.target.value)}>
          <option value="date">Дата счета</option>
          <option value="amount">Сумма</option>
          <option value="status">Статус</option>
          <option value="counterparty">Контрагент</option>
        </select>

        <select value={sortDir} onChange={e => setSortDir(e.target.value)}>
          <option value="desc">По убыванию</option>
          <option value="asc">По возрастанию</option>
        </select>
      </div>

      <div className="invoices-table-wrapper">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Контрагент</th>
              <th>Тип</th>
              <th>Сумма</th>
              <th>Категория</th>
              <th>Статус</th>
              <th>Оплатить до</th>
              <th>Дейтсвия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-row">Нет счетов</td>
              </tr>
            ) : filtered.map(inv => (
              <tr key={inv.id}>
                <td>{inv.invoiceDate}</td>
                <td>{inv.counterpartyName || '—'}</td>
                <td>{inv.invoiceType === 'INCOME' ? 'Доход' : 'Расход'}</td>
                <td className={inv.invoiceType === 'INCOME' ? 'amount income' : 'amount expense'}>
                  {inv.invoiceType === 'INCOME' ? '+' : '-'}{Number(inv.amount).toFixed(2)}
                </td>
                <td>{inv.categoryName || '—'}</td>
                <td>{inv.status || '—'}</td>
                <td>{inv.payUpDate}</td>
                {inv.status !== 'Оплачен' ? (
                  <td>
                    <button
                      className="btn-pay"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPayModalOpen(true);
                      }}
                    >
                      Оплатить
                    </button>
                  </td>
                ) : (
                  <td />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
        accounts={accounts}
        categories={categories}
        counterparties={counterparties}
        organizationId={user.organizationId}
      />
      <PayInvoiceModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onPaid={handlePaid}
        invoice={selectedInvoice}
        account={accounts.find(a => a.id === selectedInvoice?.accountId)}
        category={categories.find(c => c.id === selectedInvoice?.categoryId)}
        counterparty={counterparties.find(c => c.id === selectedInvoice?.counterpartyId)}
        organizationId={user.organizationId}
      />
    </div>
  );
}


