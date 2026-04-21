/*
 * Компонент для отображения сообщения об ошибке.
 * @param {boolean} active - флаг, который определяет, должно ли отображаться сообщение об ошибке
 * @param {string} error - сообщение об ошибке
 * @returns {JSX.Element}
*/
export function ErrorMessage({ active, error }) {
  return (
    <div>
      {active && (
        <div className="alert alert-error page-alert-error" role="alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
