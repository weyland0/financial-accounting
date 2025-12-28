import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCounterpartiesByOrganization } from '../services/counterpartyService';
import { CreateCounterpartyModal } from '../components/CreateCounterpartyModal';
import { UpdateCounterpartyModal } from '../components/UpdateCounterpartyModal';
import '../styles/Counterparties.css';

export function Counterparties() {
  const { user, loading } = useAuth();
  const [counterparties, setCounterparties] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentCounterparty, setCurrentCounterparty] = useState(null);


  useEffect(() => {
    const load = async () => {
      if (!user?.organizationId) return;
      try {
        setError(null);
        const data = await getCounterpartiesByOrganization(user.organizationId);
        setCounterparties(data);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки контрагентов');
      }
    };
    load();
  }, [user?.organizationId]);

  const handleCreated = (cp) => {
    setCounterparties(prev => [...prev, cp].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleUpdated = (cp) => {
    setCounterparties(prev =>
      prev.map(item => item.id === cp.id ? cp : item)
         .sort((a, b) => a.name.localeCompare(b.name))
    );
  };
  

  const filtered = useMemo(() => {
    let list = [...counterparties];
    if (typeFilter !== 'ALL') {
      list = list.filter(c => (c.type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(s) ||
        (c.category || '').toLowerCase().includes(s) ||
        (c.type || '').toLowerCase().includes(s) ||
        (c.email || '').toLowerCase().includes(s)
      );
    }
    return list;
  }, [counterparties, typeFilter, search]);

  if (loading) {
    return (
      <div className="counterparties-loading">
        <div className="loading-spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="counterparties-container">
        <div className="counterparties-empty">
          <h2>Организация не выбрана</h2>
          <p>Создайте или выберите организацию, чтобы управлять контрагентами.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="counterparties-container">
      <div className="counterparties-header">
        <div>
          <h1>Клиенты / Партнеры</h1>
          <p>Контрагенты вашей организации</p>
        </div>
        <button className="btn-create-counterparty" onClick={() => setModalOpen(true)}>
          ➕ Добавить
        </button>
      </div>

      {error && (
        <div className="counterparties-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="counterparties-filters">
        <input
          type="text"
          placeholder="Поиск по имени, категории, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="ALL">Все</option>
          <option value="клиент">Клиент</option>
          <option value="партнер">Партнер</option>
          <option value="поставщик">Поставщик</option>
        </select>
      </div>

      <div className="counterparties-table-wrapper">
        <table className="counterparties-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Тип</th>
              <th>Категория</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-row">Нет контрагентов</td>
              </tr>
            ) : filtered.map(cp => (
              <tr key={cp.id}>
                <td>{cp.name}</td>
                <td>{cp.type || '—'}</td>
                <td>{cp.category || '—'}</td>
                <td>{cp.phone || '—'}</td>
                <td>{cp.email || '—'}</td>
                <td> <button className="btn-updated-counterparty" onClick={ () => { 
                  setCurrentCounterparty(cp); setUpdateModalOpen(true); 
                  }}> </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateCounterpartyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
        organizationId={user.organizationId}
      />

      <UpdateCounterpartyModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onUpdated={handleUpdated}
        oldFormData={currentCounterparty}
      />
    </div>
  );
}

