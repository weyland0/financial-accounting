import { useEffect, useMemo, useState } from 'react';
import { createTransaction } from '../services/transactionService';
import '../styles/CreateTransactionModal.css';

export function CreateTransactionModal({
  isOpen,
  onClose,
  onCreated,
  transactionType = 'INCOME',
  accounts = [],
  categories = [],
  organizationId
}) {
  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    transactionDate: '',
    amount: '',
    status: '',
    counterparty: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        accountId: accounts[0]?.id || '',
        categoryId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        amount: '',
        status: '',
        counterparty: ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, accounts]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      transactionType === 'INCOME'
        ? c.categoryType === 'INCOME'
        : c.categoryType === 'EXPENSE'
    );
  }, [categories, transactionType]);

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

    if (!formData.accountId) {
      setError('Выберите счет');
      setLoading(false);
      return;
    }
    if (!formData.categoryId) {
      setError('Выберите статью учета');
      setLoading(false);
      return;
    }
    if (!formData.transactionDate) {
      setError('Укажите дату');
      setLoading(false);
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Сумма должна быть больше 0');
      setLoading(false);
      return;
    }

    try {
      if (!organizationId) {
        setError('Организация не выбрана');
        setLoading(false);
        return;
      }

      const selectedAccount = accounts.find(a => a.id === Number(formData.accountId));
      if (!selectedAccount) {
        setError('Выбранный счет не найден');
        setLoading(false);
        return;
      }

      // Валидация и подготовка данных
      const transactionDate = formData.transactionDate;
      if (!transactionDate) {
        setError('Дата обязательна');
        setLoading(false);
        return;
      }

      // Убеждаемся, что дата в формате YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(transactionDate)) {
        setError('Неверный формат даты');
        setLoading(false);
        return;
      }

      // Преобразуем в числа и проверяем
      const orgId = Number(organizationId);
      const accId = Number(formData.accountId);
      const catId = Number(formData.categoryId);
      const amount = Number(formData.amount);

      // Отладочный вывод
      console.log('Проверка полей:', {
        organizationId: orgId,
        accountId: accId,
        categoryId: catId,
        amount: amount,
        formDataAccountId: formData.accountId,
        formDataCategoryId: formData.categoryId,
        formDataAmount: formData.amount
      });

      // Проверяем, что все ID валидны (больше 0)
      if (!orgId || orgId <= 0 || isNaN(orgId)) {
        setError('Организация не выбрана');
        setLoading(false);
        return;
      }
      if (!accId || accId <= 0 || isNaN(accId)) {
        setError('Выберите счет');
        setLoading(false);
        return;
      }
      if (!catId || catId <= 0 || isNaN(catId)) {
        setError('Выберите статью учета');
        setLoading(false);
        return;
      }
      if (!amount || amount <= 0 || isNaN(amount)) {
        setError('Сумма должна быть больше 0');
        setLoading(false);
        return;
      }

      const payload = {
        organizationId: orgId,
        accountId: accId,
        categoryId: catId,
        transactionType: transactionType,
        transactionDate: transactionDate,
        amount: amount,
        status: formData.status && formData.status.trim() ? formData.status.trim() : null,
        counterparty: formData.counterparty && formData.counterparty.trim() ? formData.counterparty.trim() : null
      };

      console.log('Отправка payload:', payload);
      const data = await createTransaction(payload);
      setSuccess(true);

      if (onCreated) {
        onCreated(data);
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      console.error('Ошибка при создании операции:', err);
      // Пытаемся извлечь детали ошибки валидации
      let errorMessage = err.message || 'Ошибка при создании операции';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          // Ошибки валидации ModelState
          const validationErrors = Object.values(errorData.errors).flat();
          errorMessage = validationErrors.join(', ') || errorMessage;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{transactionType === 'INCOME' ? 'Добавление дохода' : 'Добавление расхода'}</h2>
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
              <h3>Операция добавлена</h3>
              <p>Окно закроется автоматически</p>
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
                <label htmlFor="accountId">Счет *</label>
                <select
                  id="accountId"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                  required
                >
                  <option value="">Выберите счет</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency || '—'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="categoryId">Статья учета *</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                  required
                >
                  <option value="">Выберите статью</option>
                  {filteredCategories.length === 0 ? (
                    <option value="" disabled>Нет доступных статей учета</option>
                  ) : (
                    filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="transactionDate">Дата *</label>
                <input
                  id="transactionDate"
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">Сумма *</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="counterparty">Контрагент</label>
                <input
                  id="counterparty"
                  type="text"
                  name="counterparty"
                  value={formData.counterparty}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength="255"
                  placeholder="Например: ООО «Поставщик»"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Статус</label>
                <input
                  id="status"
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength="100"
                  placeholder="Например: Оплачено"
                />
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
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

