import { useEffect, useMemo, useState } from 'react';
import { payInvoice } from '../services/invoiceService';
import '../styles/CreateTransactionModal.css'; // используем те же базовые стили модалки/форм

export function PayInvoiceModal({
  isOpen,
  onClose,
  onPaid,
  invoice,
  account,
  category,
  counterparty,
  organizationId
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const remaining = useMemo(() => {
    if (!invoice) return 0;
    return Math.max(0, Number(invoice.amount || 0) - Number(invoice.paidAmount || 0));
  }, [invoice]);

  useEffect(() => {
    if (isOpen && invoice) {
      setAmount(remaining.toString());
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, invoice, remaining]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!invoice || !organizationId) {
      setError('Нет данных счета или организации');
      return;
    }
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      setError('Сумма должна быть больше 0');
      return;
    }
    if (payAmount > remaining) {
      setError('Сумма превышает остаток по счету');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        invoiceId: invoice.id,
        organizationId,
        accountId: invoice.accountId, // оплачиваем с заранее заданного счета
        amount: payAmount
      };

      const data = await payInvoice(payload);
      setSuccess(true);

      if (onPaid) {
        onPaid(data);
      }

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Ошибка при оплате');
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

  if (!isOpen || !invoice) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Оплата счета</h2>
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
              <h3>Оплата проведена</h3>
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
                <label>Контрагент</label>
                <div className="form-readonly">{counterparty?.name || invoice.counterpartyName || '—'}</div>
              </div>

              <div className="form-group">
                <label>Тип</label>
                <div className="form-readonly">{invoice.invoiceType === 'INCOME' ? 'Доход' : 'Расход'}</div>
              </div>

              <div className="form-group">
                <label>Категория</label>
                <div className="form-readonly">{category?.name || invoice.categoryName || '—'}</div>
              </div>

              <div className="form-group">
                <label>Счет</label>
                <div className="form-readonly">{account?.name || invoice.accountName || '—'}</div>
              </div>

              <div className="form-group">
                <label>Сумма счета</label>
                <div className="form-readonly">{Number(invoice.amount).toFixed(2)}</div>
              </div>

              <div className="form-group">
                <label>Оплачено</label>
                <div className="form-readonly">{Number(invoice.paidAmount || 0).toFixed(2)}</div>
              </div>

              <div className="form-group">
                <label>Остаток к оплате</label>
                <div className="form-readonly">{Number(remaining).toFixed(2)}</div>
              </div>

              <div className="form-group">
                <label htmlFor="payAmount">Сумма оплаты *</label>
                <input
                  id="payAmount"
                  type="number"
                  name="payAmount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={loading}
                  required
                  min="0"
                  step="0.01"
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
                  {loading ? 'Проведение...' : 'Оплатить'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


