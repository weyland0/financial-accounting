import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { getOrganization } from '../services/organizationService';
import { CreateOrganizationModal } from '../components/CreateOrganizationModal';
import '../styles/Dashboard.css';

export function Dashboard() {

  const navigate = useNavigate();

  const { user, loading, token } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Демо-данные организации, если пользователь еще не состоит ни в одной
  const demoOrganization = {
    name: 'ООО «Демо Организация»',
    legalEnityName: 'Общество с ограниченной ответственностью',
    registrationNumber: '0000000000',
    taxId: 'DEMO-TAX-000',
    fullAddress: 'г. Москва, ул. Примерная, д. 1, оф. 101',
    email: 'demo@company.com',
    phone: '+7 (900) 000-00-00',
  };

  const [organization, setOrganization] = useState(demoOrganization);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Загрузка...
      </div>
    );
  }

  // Если есть organizationId, загружаем реальные данные организации
  useEffect(() => {
    const getOrg = async () => {
      if (user?.organizationId) {
        try {
          // После рефакторинга: response содержит чистый DTO (OrganizationResponse)
          const response = await getOrganization(user.organizationId, token);
            setOrganization({
            name: response.name,
            legalEnityName: response.legalEnityName,
            registrationNumber: response.registrationNumber,
            taxId: response.taxId,
            fullAddress: response.fullAddress,
            email: response.email,
            phone: response.phone,
            });
        } catch (e) {
          console.error('Ошибка при загрузке организации:', e.message);
        }
      }
    };

    getOrg();

  }, [user?.organizationId, token]);

  return (
    <div className="main-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Главная панель</h1>
          <p className="header-subtitle">
            {user?.organizationId
              ? `Организация: ${organization?.name || 'Загрузка...'}` 
              : 'Вы еще не создали организацию — сейчас отображаются демонстрационные данные'}
          </p>
        </div>

        {/* Если нет организации - показываем кнопку создания */}
        {!user?.organizationId && (
          <button 
            className="btn-create-org-header"
            onClick={() => setShowModal(true)}
            title="Создать организацию для начала работы"
          >
            Создать организацию
          </button>
        )}
      </div>

      {/* Баннер-приглашение создать организацию, если ее еще нет */}
      {!user?.organizationId && (
        <div className="notification-banner">
          <div className="notification-icon">⚠️</div>
          <div className="notification-content">
            <h3>Организация не создана</h3>
            <p>
              Сейчас вы видите демо‑данные. Для работы с реальными данными создайте организацию.
            </p>
          </div>
          <button 
            className="btn-notification"
            onClick={() => setShowModal(true)}
          >
            Создать сейчас
          </button>
        </div>
      )}

      {/* Блок информации о пользователе */}
      <div className="info-section">
        <h2>Пользователь</h2>
        <div className="organization-info-card">
          <div className="info-row">
            <label>ID:</label>
            <span>{user.id}</span>
          </div>
          <div className="info-row">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="info-row">
            <label>Роль:</label>
            <span>{user.roleId}</span>
          </div>
          <div className="info-row">
            <label>Организация ID:</label>
            <span>{user.organizationId || '— (демо режим)'}</span>
          </div>
        </div>
      </div>

      {/* Блок информации об организации */}
      <div className="info-section">
        <h2>Информация об организации</h2>
        <div className="organization-info-card">
          <div className="info-row">
            <label>Название:</label>
            <span>{organization.name}</span>
          </div>
          <div className="info-row">
            <label>Орг‑правовая форма:</label>
            <span>{organization.legalEnityName}</span>
          </div>
          <div className="info-row">
            <label>Регистрационный номер:</label>
            <span>{organization.registrationNumber}</span>
          </div>
          <div className="info-row">
            <label>Tax ID:</label>
            <span>{organization.taxId}</span>
          </div>
          <div className="info-row">
            <label>Адрес:</label>
            <span>{organization.fullAddress}</span>
          </div>
          <div className="info-row">
            <label>Email:</label>
            <span>{organization.email}</span>
          </div>
          <div className="info-row">
            <label>Телефон:</label>
            <span>{organization.phone}</span>
          </div>
        </div>
      </div>

      {/* Пример основного функционала — если нет организации, показываем как демо */}
      <div className="features-section">
        <h2>Основной функционал</h2>

        <div className="features-grid">
          <div 
            className="feature-card clickable" 
            onClick={() => navigate('/accounts')}
          >
            <h3>Счета</h3>
            <p>{user?.organizationId ? 'Просмотр банковских счетов вашей организации' : 'Демо‑просмотр счетов'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => navigate('/transactions')}
          >
            <h3>Операции</h3>
            <p>{user?.organizationId ? 'Доходы и расходы, поиск и фильтры' : 'Демо‑режим операций'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => navigate('/categories')}
          >
            <h3>Статьи учета</h3>
            <p>{user?.organizationId ? 'Управление поступлениями и расходами' : 'Демо‑режим категорий'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => navigate('/counterparties')}
          >
            <h3>Клиенты/Партнеры</h3>
            <p>{user?.organizationId ? 'Справочник контрагентов' : 'Демо‑режим контрагентов'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => navigate('/invoices')}
          >
            <h3>Счета на оплату</h3>
            <p>{user?.organizationId ? 'Обазательва вашей компании' : 'Демо‑режим просмотра счетов на оплату'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => navigate('/reports/pnl')}
          >
            <h3>P&amp;L (Прибыли и убытки)</h3>
            <p>{user?.organizationId ? 'Отчёт о прибылях и убытках по периодам' : 'Демо‑режим отчётов'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => navigate('/reports/cashflow')}
          >
            <h3>Cash Flow (Движение денежных средств)</h3>
            <p>{user?.organizationId ? 'Отчёт о движении денежных средств по периодам' : 'Демо‑режим отчётов'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div>
          
          {/* <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Сотрудники</h3>
            <p>{user?.organizationId ? 'Управление сотрудниками вашей организации' : 'Демо‑режим управления сотрудниками'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div> */}

          {/* <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Финансы</h3>
            <p>{user?.organizationId ? 'Учет реальных доходов и расходов' : 'Демо‑учет доходов и расходов'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div> */}

          {/* <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>Настройки</h3>
            <p>{user?.organizationId ? 'Настройка параметров организации' : 'Демо‑настройки (реальные будут после создания организации)'}</p>
            {!user?.organizationId && <div className="disabled-overlay" />}
          </div> */}
        </div>
      </div>

      {/* Модальное окно */}
      <CreateOrganizationModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

// export default Dashboard;
