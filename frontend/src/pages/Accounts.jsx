import { React, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllAccountsByOrganization } from "../services/accountService";
import { AccountCard } from "../components/AccountCard";
import { CreateAccountModal } from "../components/CreateAccountModal";
import { canCreate } from "../config/roles";

import { PageHeader } from "../shared/ui/PageHeader";
import { PageHeaderActions } from "../shared/ui/PageHeaderActions";
import { ErrorMessage } from "../shared/ui/ErrorMessage";
import { EmptyPage } from "../shared/ui/EmptyPage";
import { PageLoading } from "../shared/ui/PageLoading";

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
    return <PageLoading />;
  }

  if (!user?.organizationId) {
    return (
      <EmptyPage
        title="Организация не выбрана"
        description="Для работы со счетами необходимо создать организацию"
      />
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

      <ErrorMessage active={error != null} error={error}/>

      {accounts.length === 0 ? (
        <EmptyPage
          shell={false}
          title="Счетов пока нет"
          description="Создайте первый счет для начала работы"
          icon="💳"
        >
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            type="button"
          >
            Создать счет
          </button>
        </EmptyPage>
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
