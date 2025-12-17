import { useEffect, useMemo, useState } from 'react';
import { createInvoice } from '../services/invoiceService';
import '../styles/CreateInvoiceModal.css';

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreated,
  accounts = [],
  categories = [],
  counterparties = [],
  organizationId
}) {
  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    counterpartyId: '',
    invoiceType: 'INCOME',
    invoiceDate: '',
    payUpDate: '',
    amount: '',
    status: 'Не оплачен'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        accountId: accounts[0]?.id || '',
        categoryId: '',
        counterpartyId: counterparties[0]?.id || '',
        invoiceType: 'INCOME',
        invoiceDate: new Date().toISOString().split('T')[0],
        payUpDate: new Date().toISOString().split('T')[0],
        amount: '',
        status: 'Не оплачен'
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, accounts, counterparties]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      formData.invoiceType === 'INCOME'
        ? c.categoryType === 'INCOME'
        : c.categoryType === 'EXPENSE'
    );
  }, [categories, formData.invoiceType]);

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

    try {
      if (!organizationId) {
        setError('Организация не выбрана');
        setLoading(false);
        return;
      }

      if (!formData.accountId) {
        setError('Выберите счет');
        setLoading(false);
        return;
      }
      if (!formData.categoryId) {
        setError('Выберите категорию');
        setLoading(false);
        return;
      }
      if (!formData.counterpartyId) {
        setError('Выберите контрагента');
        setLoading(false);
        return;
      }
      if (!formData.invoiceDate) {
        setError('Укажите дату счета');
        setLoading(false);
        return;
      }
      if (!formData.payUpDate) {
        setError('Укажите дату оплаты');
        setLoading(false);
        return;
      }
      if (!formData.amount || Number(formData.amount) <= 0) {
        setError('Сумма должна быть больше 0');
        setLoading(false);
        return;
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.invoiceDate) || !dateRegex.test(formData.payUpDate)) {
        setError('Неверный формат даты');
        setLoading(false);
        return;
      }

      const orgId = Number(organizationId);
      const accId = Number(formData.accountId);
      const catId = Number(formData.categoryId);
      const cpId = Number(formData.counterpartyId);
      const amount = Number(formData.amount);

      if (!orgId || isNaN(orgId)) {
        setError('Организация не выбрана');
        setLoading(false);
        return;
      }
      if (!accId || isNaN(accId)) {
        setError('Выберите счет');
        setLoading(false);
        return;
      }
      if (!catId || isNaN(catId)) {
        setError('Выберите категорию');
        setLoading(false);
        return;
      }
      if (!cpId || isNaN(cpId)) {
        setError('Выберите контрагента');
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
        counterpartyId: cpId,
        invoiceType: formData.invoiceType,
        invoiceDate: formData.invoiceDate,
        payUpDate: formData.payUpDate,
        amount: amount,
        status: formData.status && formData.status.trim() ? formData.status.trim() : null
      };

      const data = await createInvoice(payload);
      setSuccess(true);

      if (onCreated) {
        onCreated(data);
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      const message =
        err.message ||
        'Ошибка при создании счета';
      setError(message);
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
          <h2>Выставить счет</h2>
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
              <h3>Счет создан</h3>
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
                <label htmlFor="counterpartyId">Контрагент *</label>
                <select
                  id="counterpartyId"
                  name="counterpartyId"
                  value={formData.counterpartyId}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                  required
                >
                  <option value="">Выберите контрагента</option>
                  {counterparties.map(cp => (
                    <option key={cp.id} value={cp.id}>
                      {cp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="invoiceType">Тип *</label>
                <select
                  id="invoiceType"
                  name="invoiceType"
                  value={formData.invoiceType}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                  required
                >
                  <option value="INCOME">Счет контрагенту (Доход)</option>
                  <option value="EXPENSE">Счет организации (Расход)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="categoryId">Категория *</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                  required
                >
                  <option value="">Выберите категорию</option>
                  {filteredCategories.length === 0 ? (
                    <option value="" disabled>Нет доступных категорий</option>
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
                <label htmlFor="invoiceDate">Дата счета *</label>
                <input
                  id="invoiceDate"
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="payUpDate">Оплатить до *</label>
                <input
                  id="payUpDate"
                  type="date"
                  name="payUpDate"
                  value={formData.payUpDate}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Статус</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                >
                  <option value="Не оплачен">Не оплачен</option>
                  <option value="Оплачен частично">Оплачен частично</option>
                  <option value="Оплачен">Оплачен</option>
                </select>
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


