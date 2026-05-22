import { Link } from 'react-router-dom';

/**
 * @param {{ material: { id: string, title: string, sourceType?: string, updatedAt?: string } }} props
 */
export default function MaterialCard({ material }) {
  return (
    <article className="source-card">
      <h3 className="source-card__title">
        <Link to={`/study-materials/${material.id}`} className="source-card__link">
          {material.title}
        </Link>
      </h3>
      <p className="source-card__meta">
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
