import { React, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllAccountsByOrganization } from "../services/accountService";
import { AccountCard } from "../components/AccountCard";
import { CreateAccountModal } from "../components/CreateAccountModal";
import { canCreate } from "../config/roles";

import { PageHeader } from "../shared/ui/PageHeader";
import { PageHeaderActions } from "../shared/ui/PageHeaderActions"; 

import "../styles/pages/accounts.css";

export function Accounts() {
  const { user, loading, token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const loadAccounts = async () => {
    if (user?.organizationId && token) {
      try {
        setError(null);
        const data = await getAllAccountsByOrganization(
          user.organizationId,
          token
        );
        setAccounts(data);
      } catch (e) {
        console.error("Ошибка при загрузке счетов:", e.message);
        setError(e.message || "Ошибка при загрузке счетов");
      }
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [user?.organizationId, token]);

  const handleAccountCreated = (newAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
  };

  if (loading) {
    return (
      <div className="accounts-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="page-shell">
        <div className="accounts-empty">
          <h2>Организация не выбрана</h2>
          <p>Для работы со счетами необходимо создать организацию</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Счета организации"
        subtitle="Управление счетами вашей организации"
      >
        <PageHeaderActions disabled={!canCreate(user.roleName, "/accounts")}>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            title="Создать новый счет"
            type="button"
          >
            ➕ Создать счет
          </button>
        </PageHeaderActions>
      </PageHeader>

      {error && (
        <div className="alert alert-error page-alert-error" role="alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="accounts-empty-state">
          <div className="empty-icon">💳</div>
          <h2>Счетов пока нет</h2>
          <p>Создайте первый счет для начала работы</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            type="button"
          >
            Создать счет
          </button>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      <CreateAccountModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAccountCreated={handleAccountCreated}
      />
    </div>
  );
}
