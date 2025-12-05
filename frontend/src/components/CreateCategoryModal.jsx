import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createCategory } from '../services/categoryService';
import '../styles/CreateCategoryModal.css';

export function CreateCategoryModal({ isOpen, onClose, onCategoryCreated, categories = [] }) {

  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    categoryType: '',
    activityType: '',
    description: '',
    parentId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const categoryTypeOptions = [
    { value: 'INCOME', label: 'Доход' },
    { value: 'EXPENSE', label: 'Расход' }
  ];

  const parentOptions = useMemo(() => {
    if (!categories?.length) {
      return [];
    }

    return categories.map(category => ({
      value: category.categoryId,
      label: category.name
    }));
  }, [categories]);

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
      setError('Имя категории обязательно');
      setLoading(false);
      return;
    }

    if (!formData.categoryType) {
      setError('Тип категории обязателен');
      setLoading(false);
      return;
    }

    if (!formData.activityType.trim()) {
      setError('Вид деятельности обязателен');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        categoryType: formData.categoryType,
        activityType: formData.activityType.trim(),
        description: formData.description.trim() || null,
        organizationId: user.organizationId,
        parentId: formData.parentId ? Number(formData.parentId) : null
      };

      const data = await createCategory(payload, token);
      setSuccess(true);

      if (onCategoryCreated) {
        onCategoryCreated(data);
      }

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Ошибка при создании категории');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        categoryType: '',
        activityType: '',
        description: '',
        parentId: ''
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Новая статья учета</h2>
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
              <h3>Категория создана!</h3>
              <p>Модалка скоро закроется...</p>
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
                <label htmlFor="categoryName">
                  Имя <span className="required">*</span>
                </label>
                <input
                  id="categoryName"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Например: Продажи"
                  disabled={loading}
                  required
                  maxLength="255"
                />
                <small>Название статьи учета</small>
              </div>

              <div className="form-group">
                <label htmlFor="categoryType">
                  Тип <span className="required">*</span>
                </label>
                <select
                  id="categoryType"
                  name="categoryType"
                  value={formData.categoryType}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="form-select"
                >
                  <option value="">Выберите тип</option>
                  {categoryTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small>Доход или расход</small>
              </div>

              <div className="form-group">
                <label htmlFor="activityType">
                  Вид деятельности <span className="required">*</span>
                </label>
                <input
                  id="activityType"
                  type="text"
                  name="activityType"
                  value={formData.activityType}
                  onChange={handleChange}
                  placeholder="Например: Операционная"
                  disabled={loading}
                  required
                  maxLength="255"
                />
                <small>Например, операционная, инвестиционная и т.д.</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Краткое описание категории"
                  disabled={loading}
                  rows="4"
                  maxLength="500"
                  className="form-textarea"
                />
                <small>Необязательное поле</small>
              </div>

              <div className="form-group">
                <label htmlFor="parentId">Родительская категория</label>
                <select
                  id="parentId"
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  disabled={loading || parentOptions.length === 0}
                  className="form-select"
                >
                  <option value="">Без родителя</option>
                  {parentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <small>Выберите родителя при необходимости</small>
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
                  {loading ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

