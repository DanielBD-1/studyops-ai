import { Link } from 'react-router-dom';

/**
 * @param {{ material: { id: string, title: string, sourceType?: string, updatedAt?: string } }} props
 */
export default function MaterialCard({ material }) {
  return (
    <article
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '1rem',
        marginBottom: '0.75rem',
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>
        <Link
          to={`/study-materials/${material.id}`}
          style={{ color: '#1a56db', textDecoration: 'none' }}
        >
          {material.title}
        </Link>
      </h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
        {material.sourceType === 'paste' ? 'Pasted text' : 'Manual entry'}
        {material.updatedAt && (
          <>
            {' '}
            · Updated {new Date(material.updatedAt).toLocaleDateString()}
          </>
        )}
      </p>
    </article>
  );
}
