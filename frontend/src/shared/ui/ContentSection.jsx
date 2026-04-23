import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

/*
 * Компонент для отображения секции контента.
 * @param {string} title - заголовок секции
 * @param {boolean} errorActive - флаг, определяющий, должно ли отображаться сообщение об ошибке
 * @param {string} errorMessage - сообщение об ошибке
 * @param {boolean} loading - флаг, определяющий, должно ли отображаться состояние загрузки
 * @param {string} loadingMessage - сообщение о загрузке
 * @param {React.ReactNode} children - дочерние элементы
 * @returns {JSX.Element}
*/
export function ContentSection({
  title,
  errorActive,
  errorMessage,
  loading,
  loadingMessage = 'Загрузка...',
  children,
}) {
  return (
    <section
      className="page-panel page-panel--padded page-panel--elevated page-panel--spacing"
      aria-label={title}
    >
      <h2 className="page-section-title dashboard-summary__title">{title}</h2>

      <ErrorMessage active={errorActive} error={errorMessage} />

      {loading ? <LoadingSpinner message={loadingMessage} /> : children}

    </section>
  );
}
