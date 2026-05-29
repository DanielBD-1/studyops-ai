/**
 * @param {{
 *   title?: string,
 *   children: import('react').ReactNode,
 *   ai?: boolean,
 *   plan?: boolean,
 *   className?: string,
 * }} props
 */
export default function FormCard({ title, children, ai = false, plan = false, className = '' }) {
  const cardClass = [
    'form-card',
    ai && 'form-card--ai',
    plan && 'form-card--plan',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={cardClass}>
      {title && <h2 className="form-card__title">{title}</h2>}
      {children}
    </section>
  );
}
