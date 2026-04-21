import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInvoicesByOrganization } from '../services/invoiceService';
import { getAllAccountsByOrganization } from '../services/accountService';
import { getCategoriesByOrganization } from '../services/categoryService';
import { getCounterpartiesByOrganization } from '../services/counterpartyService';
import { CreateInvoiceModal } from '../components/CreateInvoiceModal';
import { PayInvoiceModal } from '../components/PayInvoiceModal';
import { canCreate } from '../config/roles';
import { PageHeader } from '../shared/ui/PageHeader';
import { EmptyPage } from '../shared/ui/EmptyPage';
import { PageLoading } from '../shared/ui/PageLoading';
import {
  getInvoiceDueBucket,
  invoiceRemaining,
  isInvoiceOpen,
  matchesDueFilter,
  overdueDaysCount,
  summarizeDueInvoices,
} from '../utils/invoices';
import { formatMoney } from '../utils/numbers';
import '../styles/pages/invoices.css';

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
  const [dueFilter, setDueFilter] = useState('ALL');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const dueStats = useMemo(
    () => summarizeDueInvoices(invoices),
    [invoices],
  );

  useEffect(() => {
    const load = async () => {
      if (!user?.organizationId) return;
      try {
        setError(null);
        const [items, accs, cats, cps] = await Promise.all([
          getInvoicesByOrganization(user.organizationId),
          getAllAccountsByOrganization(user.organizationId),
          getCategoriesByOrganization(user.organizationId),
          getCounterpartiesByOrganization(user.organizationId),
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
    setInvoices((prev) => [invoice, ...prev]);
  };

  const handlePaid = (updated) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updated.id ? updated : inv)),
    );
  };

  const filtered = useMemo(() => {
    let list = [...invoices];

    if (typeFilter !== 'ALL') {
      list = list.filter((i) => i.invoiceType === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      const s = statusFilter.toLowerCase();
      list = list.filter((i) => (i.status || '').toLowerCase() === s);
    }

    list = list.filter((inv) => matchesDueFilter(inv, dueFilter));

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (i) =>
          (i.counterpartyName || '').toLowerCase().includes(s) ||
          (i.categoryName || '').toLowerCase().includes(s) ||
          (i.status || '').toLowerCase().includes(s),
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = new Date(a.invoiceDate) - new Date(b.invoiceDate);
      } else if (sortField === 'payUp') {
        cmp = new Date(a.payUpDate || 0) - new Date(b.payUpDate || 0);
      } else if (sortField === 'amount') {
        cmp = Number(a.amount) - Number(b.amount);
      } else if (sortField === 'remaining') {
        cmp = invoiceRemaining(a) - invoiceRemaining(b);
      } else if (sortField === 'status') {
        cmp = (a.status || '').localeCompare(b.status || '');
      } else if (sortField === 'counterparty') {
        cmp = (a.counterpartyName || '').localeCompare(
          b.counterpartyName || '',
        );
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [
    invoices,
    typeFilter,
    statusFilter,
    dueFilter,
    search,
    sortField,
    sortDir,
  ]);

  if (loading) {
    return <PageLoading />;
  }

  if (!user?.organizationId) {
    return (
      <EmptyPage
        title="Организация не выбрана"
        description="Создайте или выберите организацию, чтобы работать со счетами."
      />
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Счета на оплату"
        subtitle="Выставленные вашей организацией и для вашей организации"
      >
        {canCreate(user.roleName, '/invoices') && (
          <div className="page-header-actions">
            <button
              type="button"
              className="btn-create-invoice"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ Выставить счет
            </button>
          </div>
        )}
      </PageHeader>

      {error && (
        <div className="alert alert-error page-alert-error" role="alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {(dueStats.overdueCount > 0 || dueStats.upcomingCount > 0) && (
        <div
          className="invoices-due-summary"
          role="region"
          aria-label="Сводка по срокам оплаты"
        >
          {dueStats.overdueCount > 0 && (
            <button
              type="button"
              className={`invoices-due-summary__chip invoices-due-summary__chip--danger${
                dueFilter === 'OVERDUE' ? ' is-active' : ''
              }`}
              onClick={() => setDueFilter('OVERDUE')}
            >
              <span className="invoices-due-summary__chip-title">
                Просрочено
              </span>
              <span className="invoices-due-summary__chip-meta">
                {dueStats.overdueCount} шт. ·{' '}
                {formatMoney(dueStats.overdueSum)}
              </span>
            </button>
          )}
          {dueStats.upcomingCount > 0 && (
            <button
              type="button"
              className={`invoices-due-summary__chip invoices-due-summary__chip--warning${
                dueFilter === 'UPCOMING_WEEK' ? ' is-active' : ''
              }`}
              onClick={() => setDueFilter('UPCOMING_WEEK')}
            >
              <span className="invoices-due-summary__chip-title">
                Срок до 7 дней
              </span>
              <span className="invoices-due-summary__chip-meta">
                {dueStats.upcomingCount} шт. ·{' '}
                {formatMoney(dueStats.upcomingSum)}
              </span>
            </button>
          )}
          {(dueStats.overdueCount > 0 || dueStats.upcomingCount > 0) && (
            <button
              type="button"
              className={`invoices-due-summary__chip invoices-due-summary__chip--neutral${
                dueFilter === 'ATTENTION' ? ' is-active' : ''
              }`}
              onClick={() => setDueFilter('ATTENTION')}
            >
              <span className="invoices-due-summary__chip-title">
                Все требующие внимания
              </span>
              <span className="invoices-due-summary__chip-meta">
                просрочка + скоро срок
              </span>
            </button>
          )}
        </div>
      )}

      <div className="invoices-filters filters-panel">
        <input
          type="search"
          placeholder="Поиск по контрагенту, категории, статусу"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={dueFilter}
          onChange={(e) => setDueFilter(e.target.value)}
          aria-label="Фильтр по сроку оплаты"
        >
          <option value="ALL">Все по сроку</option>
          <option value="UNPAID">Есть остаток к оплате</option>
          <option value="OVERDUE">Просрочено</option>
          <option value="UPCOMING_WEEK">Срок в ближайшие 7 дней</option>
          <option value="ATTENTION">Просрочено или срок ≤ 7 дней</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Тип счёта"
        >
          <option value="ALL">Все типы</option>
          <option value="INCOME">Доход (контрагенту)</option>
          <option value="EXPENSE">Расход (организации)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Статус счёта"
        >
          <option value="ALL">Все статусы</option>
          <option value="Оплачен">Оплачен</option>
          <option value="Оплачен частично">Оплачен частично</option>
          <option value="Не оплачен">Не оплачен</option>
        </select>

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          aria-label="Сортировка"
        >
          <option value="date">Дата счета</option>
          <option value="payUp">Оплатить до</option>
          <option value="remaining">Остаток</option>
          <option value="amount">Сумма</option>
          <option value="status">Статус</option>
          <option value="counterparty">Контрагент</option>
        </select>

        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
          aria-label="Направление сортировки"
        >
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
              <th>Остаток</th>
              <th>Категория</th>
              <th>Статус</th>
              <th>Оплатить до</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-row">
                  Нет счетов по выбранным условиям
                </td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const open = isInvoiceOpen(inv);
                const bucket = open
                  ? getInvoiceDueBucket(inv)
                  : 'paid';
                const rowClass =
                  bucket === 'overdue'
                    ? 'invoice-row--overdue'
                    : bucket === 'due_soon'
                      ? 'invoice-row--due-soon'
                      : '';
                const overdueDays = overdueDaysCount(inv);

                return (
                  <tr key={inv.id} className={rowClass}>
                    <td>{inv.invoiceDate}</td>
                    <td>{inv.counterpartyName || '—'}</td>
                    <td>
                      {inv.invoiceType === 'INCOME' ? 'Доход' : 'Расход'}
                    </td>
                    <td
                      className={
                        inv.invoiceType === 'INCOME'
                          ? 'amount income'
                          : 'amount expense'
                      }
                    >
                      {inv.invoiceType === 'INCOME' ? '+' : '-'}
                      {Number(inv.amount).toFixed(2)}
                    </td>
                    <td className="invoices-col-remaining">
                      {open ? (
                        <span
                          className={
                            bucket === 'overdue'
                              ? 'invoices-remaining invoices-remaining--overdue'
                              : bucket === 'due_soon'
                                ? 'invoices-remaining invoices-remaining--soon'
                                : 'invoices-remaining'
                          }
                        >
                          {formatMoney(invoiceRemaining(inv))}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{inv.categoryName || '—'}</td>
                    <td>{inv.status || '—'}</td>
                    <td>
                      <div className="invoices-payup-cell">
                        <span>{inv.payUpDate || '—'}</span>
                        {bucket === 'overdue' && overdueDays > 0 && (
                          <span className="invoices-due-badge invoices-due-badge--overdue">
                            −{overdueDays} дн.
                          </span>
                        )}
                        {bucket === 'due_soon' && (
                          <span className="invoices-due-badge invoices-due-badge--soon">
                            скоро
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {open ? (
                        <button
                          type="button"
                          className="btn-pay"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPayModalOpen(true);
                          }}
                        >
                          Оплатить
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })
            )}
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
        account={accounts.find((a) => a.id === selectedInvoice?.accountId)}
        category={categories.find((c) => c.id === selectedInvoice?.categoryId)}
        counterparty={counterparties.find(
          (c) => c.id === selectedInvoice?.counterpartyId,
        )}
        organizationId={user.organizationId}
      />
    </div>
  );
}
