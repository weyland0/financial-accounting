import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createAccount } from '../services/accountService';
import '../styles/CreateAccountModal.css';

export function CreateAccountModal({ isOpen, onClose, onAccountCreated }) {
  
  const { user, token } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    accountType: '',
    currency: '',
    accountNumber: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const accountTypes = [
    { value: 'cash', label: 'Наличные' },
    { value: 'currency', label: 'Валютный счет' },
    { value: 'payment', label: 'Расчетный счет' },
    { value: 'individual', label: 'Индивидуальный счет' }
  ];

  const currencyOptions = [
    { value: 'RUB', label: 'RUB' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name.trim()) {
      setError('Название счета обязательно');
      setLoading(false);
      return;
    }

    if (!formData.accountType) {
      setError('Тип счета обязателен');
      setLoading(false);
      return;
    }

    if (!formData.currency) {
      setError('Необходимо выбрать валюту счета');
      setLoading(false);
      return;
    }

    try {
      // Отправляем данные на сервер
      const accountData = {
        organizationId: user.organizationId,
        name: formData.name.trim(),
        accountType: formData.accountType,
        accountNumber: formData.accountNumber.trim() || null,
        description: formData.description.trim() || null,
        currency: formData.currency
      };

      const data = await createAccount(accountData, token);

      setSuccess(true);

      // Вызываем callback для обновления списка счетов
      if (onAccountCreated) {
        onAccountCreated(data);
      }

      // Закрываем модал через 2 сек
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Ошибка при создании счета');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        accountType: '',
        currency: '',
        accountNumber: '',
        description: ''
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen)
    return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Создание счета</h2>
          <button 
            className="modal-close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="success-message-large">
              <div className="success-icon">✅</div>
              <h3>Счет успешно создан!</h3>
              <p>Модальное окно закроется автоматически...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-message-large">
                  <span className="error-icon">❌</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">
                  Название счета <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Например: Основной расчетный счет"
                  disabled={loading}
                  required
                  maxLength="255"
                />
                <small>Это обязательное поле</small>
              </div>

              <div className="form-group">
                <label htmlFor="accountType">
                  Тип счета <span className="required">*</span>
                </label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="form-select"
                >
                  <option value="">Выберите тип счета</option>
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <small>Выберите тип счета из списка</small>
              </div>

              <div className="form-group">
                <label htmlFor="currency">
                  Валюта счета <span className="required">*</span>
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="form-select"
                >
                  <option value="">Выберите валюту</option>
                  {currencyOptions.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
                <small>Выберите валюту, в которой будет вестись учет счета</small>
              </div>

              <div className="form-group">
                <label htmlFor="accountNumber">Номер счета</label>
                <input
                  id="accountNumber"
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Например: 40702810100000000001"
                  disabled={loading}
                  maxLength="50"
                />
                <small>Необязательное поле</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Дополнительная информация о счете"
                  disabled={loading}
                  rows="4"
                  maxLength="500"
                  className="form-textarea"
                />
                <small>Необязательное поле</small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Создание...' : 'Создать счет'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

