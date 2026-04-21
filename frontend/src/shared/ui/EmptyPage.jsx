/**
 * Пустое состояние страницы. Стили: `styles/ui/empty-states.css` (класс `empty-page`).
 * @param {string} title - заголовок страницы
 * @param {string} description - описание страницы
 * @param {string} icon - иконка страницы
 * @param {React.ReactNode} children - дочерние элементы
 * @param {boolean} shell - флаг, определяющий, должна ли быть обертка для страницы
 * @param {string} shellClassName - класс обертки для страницы
 * @returns {JSX.Element}
 */
export function EmptyPage({
  title,
  description,
  icon,
  children,
  shell = true,
  shellClassName = 'page-shell',
}) {
  const inner = (
    <div className="empty-page">
      {icon != null && icon !== '' && (
        <div className="empty-page-icon" aria-hidden>
          {icon}
        </div>
      )}
      <h2>{title}</h2>
      {description != null && description !== '' && <p>{description}</p>}
      {children}
    </div>
  );

  if (!shell) {
    return inner;
  }

  return <div className={shellClassName}>{inner}</div>;
}
