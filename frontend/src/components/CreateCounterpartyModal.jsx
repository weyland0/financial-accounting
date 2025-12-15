import { useEffect, useState } from 'react';
import { createCounterparty } from '../services/counterpartyService';
import '../styles/CreateCounterpartyModal.css';

export function CreateCounterpartyModal({ isOpen, onClose, onCreated, organizationId }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        type: '',
        category: '',
        phone: '',
        email: ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!organizationId) {
      setError('Организация не выбрана');
      setLoading(false);
      return;
    }
    if (!formData.name.trim()) {
      setError('Имя обязательно');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        organizationId,
        name: formData.name.trim(),
        type: formData.type.trim() || null,
        category: formData.category.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null
      };

      const data = await createCounterparty(payload);
      setSuccess(true);
      if (onCreated) onCreated(data);
      setTimeout(() => handleClose(), 1200);
    } catch (err) {
      setError(err.message || 'Ошибка при создании контрагента');
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
          <h2>Новый контрагент</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading} aria-label="Закрыть">✕</button>
        </div>
        <div className="modal-body">
          {success ? (
            <div className="success-message-large">
              <div className="success-icon">✅</div>
              <h3>Контрагент создан</h3>
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
                <label htmlFor="name">Имя *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  maxLength={255}
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Тип</label>
                <input
                  id="type"
                  name="type"
                  type="text"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={100}
                  placeholder="Клиент / Партнер / Поставщик"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Категория</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={100}
                  placeholder="Например: Поставщик"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={50}
                  placeholder="+7 ..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={255}
                  placeholder="example@mail.com"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
                  Отмена
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
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

