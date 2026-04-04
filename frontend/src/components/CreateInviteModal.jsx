import { useEffect, useState } from "react";
import { getAllRoles } from "../services/roleService";
import { createInvite } from "../services/inviteService";
import "../styles/components/modals/create-invite-modal.css";

export function CreateInviteModal({
  isOpen,
  onClose,
  onCreated,
  organizationId,
  token,
}) {
  const DEFAULT_DAY_TO_EXPIRES_VALUE = 7;

  const [formData, setFormData] = useState({
    id: '',
    daysToExpired: DEFAULT_DAY_TO_EXPIRES_VALUE,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invite_token, setInviteToken] = useState('');

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: '',
        daysToExpired: DEFAULT_DAY_TO_EXPIRES_VALUE,
      });
      setError(null);
      setSuccess(false);
    }

    const fetchRoles = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await getAllRoles(token);
        setRoles(response);
      } catch (e) {
        setError(e.message || "Ошибка при получении доступных ролей");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        id: '',
        daysToExpired: DEFAULT_DAY_TO_EXPIRES_VALUE,
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.daysToExpired <= 0) {
      setError("Время жизни ссылки не может быть меньше 0");
    }

    try {
      const payload = {
        organizationId: organizationId,
        roleId: formData.id,
        daysToExpired: formData.daysToExpired,
      };

      const response = await createInvite(payload, token);
      setInviteToken(response.token);
      setSuccess(true);

      if (onCreated) {
        onCreated(response);
      }
    } catch (err) {
      setError(err.message || "Ошибка при создании приглашения");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(`http://localhost:5173/invite/${invite_token}`);
      } catch (err) {
        console.error('Не удалось скопировать: ', err);
      }
  };

  if (!isOpen) { return null };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Новое приглашение</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading} aria-label="Закрыть">✕</button>
        </div>
        <div className="modal-body">
          {success ? (
            <div className="success-message-large">
              <h3>Приглашение создано</h3>
              <p className="success-subtitle">
                Скопируйте ссылку ниже и отправьте её человеку, которого хотите пригласить.
              </p>

              <div className="invite-link-row">
                <div className="invite-link">
                  <p> http://localhost:5173/invite/{invite_token} </p>
                </div>
                <button className="btn btn-primary invite-link-copy" onClick={handleCopyToClipboard}>
                  Copy
                </button>
              </div>
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
                <label htmlFor="id">Роль *</label>
                <select
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                  required
                >
                  <option value="0">Выберете роль</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="daysToExpired">Дней до истечения *</label>
                <input
                  id="daysToExpired"
                  name="daysToExpired"
                  type="number"
                  value={formData.daysToExpired}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  min={1}
                  max={30}
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
