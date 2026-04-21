/*
 * Компонент для отображения действий в заголовке страницы.
 * @param {boolean} disabled - флаг, который определяет, должны ли действия быть доступны
 * @param {React.ReactNode} children - дочерние элементы
 * @returns {JSX.Element}
*/
export function PageHeaderActions({ disabled, children }) {
  return (
    <div>
      {!disabled && (
        <div className="page-header-actions">
          {children}
        </div>
      )}
    </div>
  );
}
