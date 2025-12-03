import { React, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllAccountsByOrganization } from "../services/accountService";
import { AccountCard } from "../components/AccountCard";
import { CreateAccountModal } from "../components/CreateAccountModal";
import "../styles/Accounts.css";

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
    // Добавляем новый счет в список
    setAccounts(prev => [...prev, newAccount]);
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
      <div className="accounts-container">
        <div className="accounts-empty-state">
          <div className="empty-icon">📋</div>
          <h2>Организация не создана</h2>
          <p>Для работы со счетами необходимо создать организацию</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <div className="header-content">
          <h1>Счета организации</h1>
          <p className="header-subtitle">
            Управление счетами вашей организации
          </p>
        </div>
        <button 
          className="btn-create-account"
          onClick={() => setShowModal(true)}
          title="Создать новый счет"
        >
          ➕ Создать счет
        </button>
      </div>

      {error && (
        <div className="accounts-error">
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
            className="btn-create-account-empty"
            onClick={() => setShowModal(true)}
          >
            Создать счет
          </button>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map(account => (
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
