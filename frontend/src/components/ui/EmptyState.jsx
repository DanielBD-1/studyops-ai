import Button from './Button.jsx';

/**
 * @param {{
 *   headline: string,
 *   description: string,
 *   actionLabel: string,
 *   onAction: () => void,
 * }} props
 */
export default function EmptyState({ headline, description, actionLabel, onAction }) {
  return (
    <section className="empty-state">
      <h2 className="empty-state__title">{headline}</h2>
      <p className="empty-state__text">{description}</p>
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  );
}
