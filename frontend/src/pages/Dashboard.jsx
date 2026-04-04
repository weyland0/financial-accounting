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
  const [hasOrganization, setHasOrganization] = useState(false);
  const [organizationName, setOrganizationName] = useState('');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Загрузка...
      </div>
    );
  }

  // Проверяем наличие организации и загружаем название
  useEffect(() => {
    const checkOrganization = async () => {
      if (user?.organizationId) {
        try {
          const response = await getOrganization(user.organizationId, token);
          setHasOrganization(true);
          setOrganizationName(response.name);
        } catch (e) {
          console.error('Ошибка при загрузке организации:', e.message);
          setHasOrganization(false);
        }
      } else {
        setHasOrganization(false);
      }
    };
    checkOrganization();
  }, [user?.organizationId, token]);

  const handleNavigate = (path) => {
    if (hasOrganization) {
      navigate(path);
    }
  };

  if (!hasOrganization) {
    return (
      <div className="main-dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Главная панель</h1>
            <p className="header-subtitle">
              Выберите действие для начала работы
            </p>
          </div>
        </div>

        <div className="notification-banner">
          <div className="notification-icon">ℹ️</div>
          <div className="notification-content">
            <h3>Для работы нужен доступ к организации</h3>
            <p>
              Вступите в организацию по приглашению или создайте свою для доступа ко всем функциям системы.
            </p>
          </div>
          <button 
            className="btn-notification"
            onClick={() => setShowModal(true)}
          >
            Создать сейчас
          </button>
        </div>

        <CreateOrganizationModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    );
  }

  // Если есть организация - показываем быстрый доступ к функциям
  return (
    <div className="main-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Главная панель</h1>
          <p className="header-subtitle">
            Организация: {organizationName || 'Загрузка...'}
          </p>
        </div>
      </div>

      <div className="features-section">
        <h2>Доступные инструменты</h2>
        <div className="features-grid">
          <div 
            className="feature-card clickable" 
            onClick={() => handleNavigate('/organizationinfo')}
          >
            <div className="feature-icon">ℹ️</div>
            <h3>Ваша организация</h3>
            <p>Просмотр информации об организации</p>
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => handleNavigate('/accounts')}
          >
            <div className="feature-icon">🏦</div>
            <h3>Счета</h3>
            <p>Просмотр банковских счетов</p>
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => handleNavigate('/transactions')}
          >
            <div className="feature-icon">💳</div>
            <h3>Операции</h3>
            <p>Доходы, расходы, поиск и фильтры</p>
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => handleNavigate('/categories')}
          >
            <div className="feature-icon">📊</div>
            <h3>Статьи учета</h3>
            <p>Управление поступлениями и расходами</p>
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => handleNavigate('/counterparties')}
          >
            <div className="feature-icon">👥</div>
            <h3>Клиенты/Партнеры</h3>
            <p>Справочник контрагентов</p>
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => handleNavigate('/invoices')}
          >
            <div className="feature-icon">📋</div>
            <h3>Счета на оплату</h3>
            <p>Обязательства вашей компании</p>
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => handleNavigate('/reports/pnl')}
          >
            <div className="feature-icon">📈</div>
            <h3>P&L</h3>
            <p>Отчёт о прибылях и убытках</p>
          </div>

          <div 
            className="feature-card clickable" 
            onClick={() => handleNavigate('/reports/cashflow')}
          >
            <div className="feature-icon">💰</div>
            <h3>Cash Flow</h3>
            <p>Движение денежных средств</p>
          </div>

        </div>
      </div>
    </div>
  );
}
