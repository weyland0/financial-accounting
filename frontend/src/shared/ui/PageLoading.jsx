/**
 * Центрированный блок «загрузка» для полноэкранных страниц.
 * Стили: `styles/ui/empty-states.css` (класс `page-loading`).
 * @param {string} message - сообщение о загрузке
 * @param {boolean} showSpinner - флаг, определяющий, должен ли отображаться спиннер
 * @returns {JSX.Element}
 */
export function PageLoading({ message = 'Загрузка...', showSpinner = true }) {
  return (
    <div className="page-loading">
      {showSpinner && <div className="loading-spinner" aria-hidden />}
      <p>{message}</p>
    </div>
  );
}
