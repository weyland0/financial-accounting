/*
 * Компонент для отображения индикатора загрузки.
 * @param {string} message - сообщение о загрузке
 * @returns {JSX.Element}
 */
export function LoadingSpinner({ message = 'Загрузка...' }) {
  return (
    <div className="section-loading">
      <div className="loading-spinner" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
