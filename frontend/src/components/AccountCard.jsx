import '../styles/AccountCard.css';

const accountTypeLabels = {
  cash: { label: 'Наличные', color: '#2f8f3f' },
  currency: { label: 'Валютный счет', color: '#0ca678' },
  payment: { label: 'Расчетный счет', color: '#1976d2' },
  individual: { label: 'Индивидуальный счет', color: '#d63384' }
};

const currencyLabels = {
  RUB: 'RUB',
  USD: 'USD',
  EUR: 'EUR'
};

export function AccountCard({ account }) {
  const typeInfo = accountTypeLabels[account.accountType] || { 
    label: account.accountType, 
    color: '#6c757d' 
  };

  return (
    <div className="account-card">
      <div className="account-header">
        <div className="account-title-section">
          <h3 className="account-name">{account.name}</h3>
          {account.isActive === false && (
            <span className="account-status-inactive">Неактивен</span>
          )}
        </div>
        <span 
          className="account-type" 
          style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}
        >
          {typeInfo.label}
        </span>
      </div>
      
      <div className="account-details">
        <div className="detail-row">
          <span className="label">Баланс:</span>
          <span className="value balance">
            {account.balance !== undefined ? account.balance.toFixed(2) : '—'} {account.currency || ''}
          </span>
        </div>

        {account.currency && (
          <div className="detail-row">
            <span className="label">Валюта:</span>
            <span className="value">
              {currencyLabels[account.currency] || account.currency}
            </span>
          </div>
        )}

        {account.accountNumber && (
          <div className="detail-row">
            <span className="label">Номер счета:</span>
            <span className="value">{account.accountNumber}</span>
          </div>
        )}
        
        {account.description && (
          <div className="detail-row description-row">
            <span className="label">Описание:</span>
            <span className="value">{account.description}</span>
          </div>
        )}

        {account.createdAt && (
          <div className="detail-row meta-row">
            <span className="label">Создан:</span>
            <span className="value">
              {new Date(account.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
  