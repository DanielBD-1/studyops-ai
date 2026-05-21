/**
 * @param {{ title?: string, children: import('react').ReactNode }} props
 */
export default function FormCard({ title, children }) {
  return (
    <section
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#fafafa',
      }}
    >
      {title && <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>{title}</h2>}
      {children}
    </section>
  );
}
