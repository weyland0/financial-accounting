/**
 * Единая шапка страницы. Стили: `styles/layout/page-header.css`.
 * Действия справа — в `children`, обычно в обёртке с классом `page-header-actions`.
 */
export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div className="page-header-main">
        <h1 className="page-header-title">{title}</h1>
        {subtitle != null && subtitle !== '' && (
          <p className="page-header-subtitle">{subtitle}</p>
        )}
      </div>
      {children}
    </header>
  );
}
