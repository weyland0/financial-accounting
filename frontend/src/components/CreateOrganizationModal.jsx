import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrganization } from '../services/organizationService';
import '../styles/CreateOrganizationModal.css';

export function CreateOrganizationModal({ isOpen, onClose }) {
  
  const { user, updateUserOrganization, token } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    legalEntityName: '',
    registrationNumber: '',
    txId: '',
    fullAddress: '',
    email: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      setError('Название организации обязательно');
      setLoading(false);
      return;
    }

    try {
      // После рефакторинга: response содержит чистый DTO (OrganizationResponse)
      const data = await createOrganization(formData, token);

      setSuccess(true);

      // Обновляем organizationId у пользователя, чтобы Dashboard сразу отобразил реальные данные
      if (data?.id) {
        updateUserOrganization(data.id);
      }

      // Закрываем модал через 2 сек и перезагружаем
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err) {
      // Ошибка уже содержит сообщение из ProblemDetails
      setError(err.message || 'Ошибка при создании организации');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        legalEntityName: '',
        registrationNumber: '',
        txId: '',
        fullAddress: '',
        email: '',
        phone: ''
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
          <h2>Создание организации</h2>
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
              <h3>Организация успешно создана!</h3>
              <p>Сейчас вас перенаправит на главное меню...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-message-large">
                  <span className="error-icon">❌</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-section">
                <h4>Основная информация</h4>

                <div className="form-group">
                  <label htmlFor="name">
                    Название организации <span className="required">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Введите название организации"
                    disabled={loading}
                    required
                    maxLength="255"
                  />
                  <small>Это обязательное поле</small>
                </div>

                <div className="form-group">
                  <label htmlFor="legalEntityName">Организационно-правовая форма</label>
                  <input
                    id="legalEntityName"
                    type="text"
                    name="legalEntityName"
                    value={formData.legalEntityName}
                    onChange={handleChange}
                    placeholder="Например: ООО, АО, ИП"
                    disabled={loading}
                    maxLength="100"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Регистрационные данные</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="registrationNumber">Регистрационный номер</label>
                    <input
                      id="registrationNumber"
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="Например: 1234567890"
                      disabled={loading}
                      maxLength="50"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="txId">ID налогоплательщика</label>
                    <input
                      id="txId"
                      type="text"
                      name="txId"
                      value={formData.txId}
                      onChange={handleChange}
                      placeholder="Например: TXN123456"
                      disabled={loading}
                      maxLength="50"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Контактная информация</h4>

                <div className="form-group">
                  <label htmlFor="fullAddress">Адрес</label>
                  <input
                    id="fullAddress"
                    type="text"
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    placeholder="Полный адрес организации"
                    disabled={loading}
                    maxLength="500"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@company.com"
                      disabled={loading}
                      maxLength="255"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Телефон</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+7 (999) 123-45-67"
                      disabled={loading}
                      maxLength="20"
                    />
                  </div>
                </div>
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
                  {loading ? '⏳ Создание...' : '✨ Создать организацию'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
