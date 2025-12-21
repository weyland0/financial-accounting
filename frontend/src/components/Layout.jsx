import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import '../styles/Layout.css';

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="layout">
      <div className={`navigation-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Navigation onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="layout-content">
        <button 
          className="layout-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Меню"
        >
          ☰
        </button>
        <div className="layout-main">
          {children}
        </div>
      </div>
      {sidebarOpen && (
        <div 
          className="layout-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

