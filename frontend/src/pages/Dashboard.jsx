import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { getOrganization } from '../services/organizationService';
import { getAllAccountsByOrganization } from '../services/accountService';
import { getTransactionsByOrganization } from '../services/transactionService';
import { getInvoicesByOrganization } from '../services/invoiceService';
import { getCategoriesByOrganization } from '../services/categoryService';
import { CreateOrganizationModal } from '../components/CreateOrganizationModal';
import { aggregateCalendarMonthFinancials } from '../utils/reporting';
import { formatMoney } from '../utils/numbers';

import '../styles/pages/dashboard.css';

async function fetchAccountsSafe(orgId, token) {
  try {
    return await getAllAccountsByOrganization(orgId, token);
  } catch {
    return [];
  }
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, loading, token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [hasOrganization, setHasOrganization] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [orgLoading, setOrgLoading] = useState(false);

  useEffect(() => {
    if (!user?.organizationId) {
      setHasOrganization(false);
      setOrganizationName('');
      setStats(null);
      setStatsError(null);
      setStatsLoading(false);
      setOrgLoading(false);
      return;
    }

    let cancelled = false;
    setOrgLoading(true);

    (async () => {
      try {
        const org = await getOrganization(user.organizationId, token);
        if (cancelled) return;
        setOrganizationName(org.name);
        setHasOrganization(true);
      } catch (e) {
        console.error('Ошибка при загрузке организации:', e.message);
        if (!cancelled) {
          setHasOrganization(false);
        }
        setOrgLoading(false);
        return;
      }

      if (cancelled) {
        setOrgLoading(false);
        return;
      }

      setStatsLoading(true);
      setStatsError(null);
      try {
        const [txs, invs, cats, accs] = await Promise.all([
          getTransactionsByOrganization(user.organizationId),
          getInvoicesByOrganization(user.organizationId),
          getCategoriesByOrganization(user.organizationId, token),
          fetchAccountsSafe(user.organizationId, token),
        ]);
        if (cancelled) return;
        const categoryById = new Map(cats.map((c) => [c.id, c]));
        const built = aggregateCalendarMonthFinancials({
          transactions: txs,
          invoices: invs,
          accounts: accs,
          categoryById,
        });
        setStats(built);
      } catch (e) {
        if (!cancelled) {
          setStatsError(e.message || 'Не удалось загрузить сводку');
          setStats(null);
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
          setOrgLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.organizationId, token]);

  const handleNavigate = (path) => {
    if (hasOrganization) {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!hasOrganization && !user?.organizationId) {
    return (
      <div className="page-shell page-shell--soft page-shell--dense">
        <header className="page-header page-header--dashboard">
          <div className="page-header__lead">
            <h1>Главная панель</h1>
            <p className="page-header__subtitle page-header__subtitle--prominent">
              Выберите действие для начала работы
            </p>
          </div>
        </header>

        <div className="callout callout--info">
          <div className="callout__icon" aria-hidden>
            ℹ️
          </div>
          <div className="callout__content">
            <h3>Для работы нужен доступ к организации</h3>
            <p>
              Вступите в организацию по приглашению или создайте свою для доступа ко всем функциям системы.
            </p>
          </div>
          <button
            type="button"
            className="btn-notification"
            onClick={() => setShowModal(true)}
          >
            Создать сейчас
          </button>
        </div>

        <CreateOrganizationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    );
  }

  if (user?.organizationId && orgLoading) {
    return (
      <div className="page-shell page-shell--soft page-shell--dense">
        <div className="loading-state">
          <p>Загрузка панели…</p>
        </div>
      </div>
    );
  }

  if (!hasOrganization && user?.organizationId) {
    return (
      <div className="page-shell page-shell--soft page-shell--dense">
        <p className="dashboard-fallback-msg">Не удалось загрузить организацию.</p>
      </div>
    );
  }

  return (
    <div className="page-shell page-shell--soft page-shell--dense">
      <header className="page-header page-header--dashboard">
        <div className="page-header__lead">
          <h1>Главная панель</h1>
          <p className="page-header__subtitle page-header__subtitle--prominent">
            Организация: {organizationName || 'Загрузка...'}
          </p>
        </div>
      </header>

      <section
        className="page-panel page-panel--padded page-panel--elevated page-panel--spacing"
        aria-label="Краткая сводка"
      >
        <h2 className="page-section-title dashboard-summary__title">Сводка</h2>
        {statsError && (
          <div
            className="alert alert-error page-alert-error"
            role="alert"
          >
            {statsError}
          </div>
        )}
        {statsLoading && !stats && !statsError && (
          <p className="dashboard-summary__loading">Загрузка показателей…</p>
        )}
        {stats && (
          <div className="dashboard-summary__grid">
            <button
              type="button"
              className="stat-card dashboard-stat-card dashboard-stat-card--clickable"
              onClick={() => handleNavigate('/accounts')}
            >
              <span className="dashboard-stat-card__label">Остаток по счетам</span>
              <span className="dashboard-stat-card__value">
                {formatMoney(stats.totalLiquidity)}
              </span>
              <span className="dashboard-stat-card__hint">Сумма балансов</span>
            </button>

            <button
              type="button"
              className="stat-card dashboard-stat-card dashboard-stat-card--clickable"
              onClick={() => handleNavigate('/reports/pnl')}
            >
              <span className="dashboard-stat-card__label">
                Выручка ({stats.monthLabel})
              </span>
              <span className="dashboard-stat-card__value dashboard-stat-card__value--positive">
                {formatMoney(stats.pnlMonth.revenue)}
              </span>
              <span className="dashboard-stat-card__hint">По начислению</span>
            </button>

            <button
              type="button"
              className="stat-card dashboard-stat-card dashboard-stat-card--clickable"
              onClick={() => handleNavigate('/reports/pnl')}
            >
              <span className="dashboard-stat-card__label">
                Чистая прибыль ({stats.monthLabel})
              </span>
              <span
                className={
                  stats.pnlMonth.net >= 0
                    ? 'dashboard-stat-card__value dashboard-stat-card__value--positive'
                    : 'dashboard-stat-card__value dashboard-stat-card__value--negative'
                }
              >
                {formatMoney(stats.pnlMonth.net)}
              </span>
              <span className="dashboard-stat-card__hint">По начислению</span>
            </button>

            <button
              type="button"
              className="stat-card dashboard-stat-card dashboard-stat-card--clickable"
              onClick={() => handleNavigate('/reports/cashflow')}
            >
              <span className="dashboard-stat-card__label">
                Денежный поток ({stats.monthLabel})
              </span>
              <span
                className={
                  stats.cashMonth.net >= 0
                    ? 'dashboard-stat-card__value dashboard-stat-card__value--positive'
                    : 'dashboard-stat-card__value dashboard-stat-card__value--negative'
                }
              >
                {formatMoney(stats.cashMonth.net)}
              </span>
              <span className="dashboard-stat-card__hint">Факт по операциям</span>
            </button>

            <button
              type="button"
              className="stat-card dashboard-stat-card dashboard-stat-card--clickable"
              onClick={() => handleNavigate('/invoices')}
            >
              <span className="dashboard-stat-card__label">К оплате</span>
              <span className="dashboard-stat-card__value">
                {formatMoney(stats.unpaid.openAmount)}
              </span>
              <span className="dashboard-stat-card__hint">
                Неоплаченных: {stats.unpaid.openCount}
                {stats.unpaid.overdueCount > 0 && (
                  <>
                    {' '}
                    · просрочено: {stats.unpaid.overdueCount} (
                    {formatMoney(stats.unpaid.overdueAmount)})
                  </>
                )}
              </span>
            </button>
          </div>
        )}
      </section>

      <section className="page-panel page-panel--padded page-panel--elevated">
        <h2 className="page-section-title">Доступные инструменты</h2>
        <div className="action-tile-grid">
          <div
            className="action-tile action-tile--clickable"
            onClick={() => handleNavigate('/organizationinfo')}
          >
            <div className="action-tile__icon" aria-hidden>ℹ️</div>
            <h3>Ваша организация</h3>
            <p>Просмотр информации об организации</p>
          </div>

          <div
            className="action-tile action-tile--clickable"
            onClick={() => handleNavigate('/accounts')}
          >
            <div className="action-tile__icon" aria-hidden>🏦</div>
            <h3>Счета</h3>
            <p>Просмотр банковских счетов</p>
          </div>

          <div
            className="action-tile action-tile--clickable"
            onClick={() => handleNavigate('/transactions')}
          >
            <div className="action-tile__icon" aria-hidden>💳</div>
            <h3>Операции</h3>
            <p>Доходы, расходы, поиск и фильтры</p>
          </div>

          <div
            className="action-tile action-tile--clickable"
            onClick={() => handleNavigate('/categories')}
          >
            <div className="action-tile__icon" aria-hidden>📊</div>
            <h3>Статьи учета</h3>
            <p>Управление поступлениями и расходами</p>
          </div>

          <div
            className="action-tile action-tile--clickable"
            onClick={() => handleNavigate('/counterparties')}
          >
            <div className="action-tile__icon" aria-hidden>👥</div>
            <h3>Клиенты/Партнеры</h3>
            <p>Справочник контрагентов</p>
          </div>

          <div
            className="action-tile action-tile--clickable"
            onClick={() => handleNavigate('/invoices')}
          >
            <div className="action-tile__icon" aria-hidden>📋</div>
            <h3>Счета на оплату</h3>
            <p>Обязательства вашей компании</p>
          </div>

          <div
            className="action-tile action-tile--clickable"
            onClick={() => handleNavigate('/reports/pnl')}
          >
            <div className="action-tile__icon" aria-hidden>📈</div>
            <h3>P&L</h3>
            <p>Отчёт о прибылях и убытках</p>
          </div>

          <div
            className="action-tile action-tile--clickable"
            onClick={() => handleNavigate('/reports/cashflow')}
          >
            <div className="action-tile__icon" aria-hidden>💰</div>
            <h3>Cash Flow</h3>
            <p>Движение денежных средств</p>
          </div>

        </div>
      </section>
    </div>
  );
}
