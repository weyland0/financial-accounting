import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getOrganization, updateOrganization } from "../services/organizationService";
import { getUsersByOrganization } from "../services/userService";
import { CreateInviteModal } from "../components/CreateInviteModal";
import "../styles/OrganizationInfo.css";

export function OrganizationInfo() {
  const { user, loading, token } = useAuth();

  const [hasOrganization, setHasOrganization] = useState(false);
  const [error, setError] = useState(null);
  const [organization, setOrganization] = useState({
    name: "",
    legalEntityName: "",
    registrationNumber: "",
    taxId: "",
    fullAddress: "",
    phone: "",
    email: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(organization);
  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Загрузка организации
  useEffect(() => {
    const fetchOrganization = async () => {
      if (user?.organizationId) {
        try {
          setError(null);
          const response = await getOrganization(user.organizationId, token);
          setOrganization(response);
          setEditData(response);
          setHasOrganization(true);
        } catch (e) {
          setError(e.message || "Ошибка при загрузке организации");
        }
      }
    };
    fetchOrganization();
  }, [user?.organizationId, token]);

  // Загрузка сотрудников
  useEffect(() => {
    const fetchEmployees = async () => {
      if (user?.organizationId && hasOrganization) {
        setLoadingEmployees(true);
        try {
          setError(null);
          const response = await getUsersByOrganization(
            user.organizationId,
            token,
          );
          setEmployees(response);
        } catch (e) {
          setError(e.message || "Ошибка при загрузке сотрудников");
        } finally {
          setLoadingEmployees(false);
        }
      }
    };
    fetchEmployees();
  }, [user?.organizationId, hasOrganization, token]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setEditData(organization);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      setError(null);
      await updateOrganization(user.organizationId, editData, token);
      setOrganization(editData);
      setEditMode(false);
    } catch (e) {
      setError(e.message || "Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Загрузка...</div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="categories-container">
        <div className="categories-empty-state">
          <h2>Организация не выбрана</h2>
          <p>
            Создайте или выберите организацию чтобы управлять статьями учета.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="organization-info">
      <div className="organization-header">
        <h1>Информация об организации</h1>
        {!editMode ? (
          <button onClick={handleEditToggle} className="btn btn-primary">
            Редактировать
          </button>
        ) : (
          <div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-success"
              style={{ marginRight: "10px" }}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
            <button onClick={handleEditToggle} className="btn btn-secondary">
              Отмена
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="org-info-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="organization-details">
        <div className="field">
          <label>Название:</label>
          {editMode ? (
            <input
              name="name"
              value={editData.name}
              onChange={handleFieldChange}
              style={{ width: "100%", padding: "8px" }}
            />
          ) : (
            <span>{organization.name}</span>
          )}
        </div>
        <div className="field">
          <label>Юр. название:</label>
          {editMode ? (
            <input
              name="legalEntityName"
              value={editData.legalEntityName}
              onChange={handleFieldChange}
              style={{ width: "100%", padding: "8px" }}
            />
          ) : (
            <span>{organization.legalEntityName}</span>
          )}
        </div>
        <div className="field">
          <label>Рег. номер:</label>
          {editMode ? (
            <input
              name="registrationNumber"
              value={editData.registrationNumber}
              onChange={handleFieldChange}
              style={{ width: "100%", padding: "8px" }}
            />
          ) : (
            <span>{organization.registrationNumber}</span>
          )}
        </div>
        <div className="field">
          <label>ИНН:</label>
          {editMode ? (
            <input
              name="taxId"
              value={editData.taxId}
              onChange={handleFieldChange}
              style={{ width: "100%", padding: "8px" }}
            />
          ) : (
            <span>{organization.taxId}</span>
          )}
        </div>
        <div className="field">
          <label>Адрес:</label>
          {editMode ? (
            <input
              name="fullAddress"
              value={editData.fullAddress}
              onChange={handleFieldChange}
              style={{ width: "100%", padding: "8px" }}
            />
          ) : (
            <span>{organization.fullAddress}</span>
          )}
        </div>
        <div className="field">
          <label>Телефон:</label>
          {editMode ? (
            <input
              name="phone"
              value={editData.phone}
              onChange={handleFieldChange}
              style={{ width: "100%", padding: "8px" }}
            />
          ) : (
            <span>{organization.phone}</span>
          )}
        </div>
        <div className="field">
          <label>Email:</label>
          {editMode ? (
            <input
              name="email"
              value={editData.email}
              onChange={handleFieldChange}
              style={{ width: "100%", padding: "8px" }}
              type="email"
            />
          ) : (
            <span>{organization.email}</span>
          )}
        </div>
      </div>

      <div className="employees-section">
        <div className="organization-header">
          <h1>Сотрудники организации</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Добавить
          </button>
        </div>

        {loadingEmployees ? (
          <p>Загрузка сотрудников...</p>
        ) : employees.length === 0 ? (
          <p>Сотрудники не найдены</p>
        ) : (
          <div className="employees-list">
            {employees.map((employee) => (
              <div key={employee.id} className="employee-card">
                <div>
                  <strong className="employee-name">{employee.fullName}</strong>
                  <span className="employee-email"> ({employee.email}) </span>
                </div>
                <div className="employee-role">
                  {employee.roleName || "Сотрудник"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateInviteModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        organizationId={user.organizationId}
        token={token}
      ></CreateInviteModal>

    </div>
  );
}
