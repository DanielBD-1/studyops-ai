/**
 * @param {{ title?: string, children: import('react').ReactNode, ai?: boolean }} props
 */
export default function FormCard({ title, children, ai = false }) {
  const cardClass = ai ? 'form-card form-card--ai' : 'form-card';

  return (
    <section className={cardClass}>
      {title && <h2 className="form-card__title">{title}</h2>}
      {children}
    </section>
  );
}
