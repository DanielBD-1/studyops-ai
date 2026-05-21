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
    <section style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>{headline}</h2>
      <p style={{ color: '#555', margin: '0 0 1rem' }}>{description}</p>
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    </section>
  );
}
