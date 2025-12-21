import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

export function Navigation({ onClose }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleNavClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Главная', icon: '' },
    { path: '/accounts', label: 'Счета', icon: '' },
    { path: '/transactions', label: 'Операции', icon: '' },
    { path: '/invoices', label: 'Счета на оплату', icon: '' },
    { path: '/counterparties', label: 'Контрагенты', icon: '' },
    { path: '/categories', label: 'Статьи учета', icon: '' },
    { 
      path: '/reports/pnl', 
      label: 'Отчёты', 
      icon: '',
      children: [
        { path: '/reports/pnl', label: 'P&L (Прибыли и убытки)' },
        { path: '/reports/cashflow', label: 'Cash Flow (Движение денег)' }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/reports/pnl') {
      return location.pathname.startsWith('/reports');
    }
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>Финансовый учёт</h2>
      </div>

      <div className="nav-menu">
        {navItems.map(item => (
          <div key={item.path} className="nav-item-wrapper">
            <NavLink
              to={item.path}
              className={({ isActive: active }) => 
                `nav-item ${active || isActive(item.path) ? 'active' : ''}`
              }
              onClick={handleNavClick}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
            
            {item.children && (
              <div className={`nav-submenu ${isActive(item.path) ? 'open' : ''}`}>
                {item.children.map(child => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive: active }) => 
                      `nav-subitem ${active ? 'active' : ''}`
                    }
                    onClick={handleNavClick}
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="nav-footer">
        {user && (
          <div className="nav-user">
            <span className="user-email">{user.email}</span>
          </div>
        )}
        <button className="nav-logout" onClick={logout}>
          Выход
        </button>
      </div>
    </nav>
  );
}

