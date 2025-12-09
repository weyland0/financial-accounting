import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCategoriesByOrganization } from '../services/categoryService';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import '../styles/Categories.css';

export function Categories() {
  const { user, token, loading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.organizationId || !token) {
        return;
      }

      try {
        setError(null);
        const data = await getCategoriesByOrganization(user.organizationId, token);
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить категории');
      }
    };

    fetchCategories();
  }, [user?.organizationId, token]);

  const handleCategoryCreated = (category) => {
    setCategories(prev => [...prev, category]);
  };

  const incomeCategories = useMemo(() => categories.filter(c => c.categoryType === 'INCOME'), [categories]);
  const expenseCategories = useMemo(() => categories.filter(c => c.categoryType === 'EXPENSE'), [categories]);

  const buildHierarchy = (items) => {
    const map = new Map();
    const roots = [];

    items.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    map.forEach(item => {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(item);
      } else {
        roots.push(item);
      }
    });

    const sortTree = (nodes) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach(node => sortTree(node.children));
    };

    sortTree(roots);
    return roots;
  };

  const renderRows = (nodes, level = 0) => {
    return nodes.flatMap(node => ([
      (
        <tr key={node.id}>
          <td>
            <div
              className="category-name-cell"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {level > 0 && (
                <span className="category-branch">↳</span>
              )}
              <span>{node.name}</span>
              <span
                className={`category-scope ${
                  node.organizationId ? 'category-scope-private' : 'category-scope-shared'
                }`}
              >
                {node.organizationId ? 'Организации' : 'Общая'}
              </span>
            </div>
          </td>
          <td>{node.categoryType === 'INCOME' ? 'Доход' : 'Расход'}</td>
          <td>{node.activityType || '—'}</td>
          <td>{node.description || '—'}</td>
        </tr>
      ),
      ...renderRows(node.children, level + 1)
    ]));
  };

  if (loading) {
    return (
      <div className="categories-loading">
        <div className="loading-spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user?.organizationId) {
    return (
      <div className="categories-container">
        <div className="categories-empty-state">
          <div className="empty-icon">🏢</div>
          <h2>Организация не выбрана</h2>
          <p>Создайте или выберите организацию чтобы управлять статьями учета.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <div>
          <h1>Статьи учета</h1>
          <p>Управление поступлениями и расходами вашей организации</p>
        </div>
        <button className="btn-create-category" onClick={() => setModalOpen(true)}>
          ➕ Создать
        </button>
      </div>

      {error && (
        <div className="categories-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="categories-grid">
        <div className="category-table-card">
          <div className="category-table-header income">
            <h2>Поступления</h2>
            <span>{incomeCategories.length} категорий</span>
          </div>
          <div className="category-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Тип</th>
                  <th>Вид деятельности</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                {incomeCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      Нет категорий поступлений
                    </td>
                  </tr>
                ) : (
                  renderRows(buildHierarchy(incomeCategories))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="category-table-card">
          <div className="category-table-header expense">
            <h2>Расходы</h2>
            <span>{expenseCategories.length} категорий</span>
          </div>
          <div className="category-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Тип</th>
                  <th>Вид деятельности</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      Нет категорий расходов
                    </td>
                  </tr>
                ) : (
                  renderRows(buildHierarchy(expenseCategories))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateCategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        categories={categories}
      />
    </div>
  );
}

