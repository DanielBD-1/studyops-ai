import { Link } from 'react-router-dom';

/**
 * @param {{ material: { id: string, title: string, sourceType?: string, updatedAt?: string } }} props
 */
export default function MaterialCard({ material }) {
  const sourceLabel = material.sourceType === 'paste' ? 'Pasted text' : 'Manual entry';

  return (
    <article className="source-card source-card--document">
      <div className="source-card__header">
        <span className="source-card__pill source-card__pill--document">{sourceLabel}</span>
      </div>
      <h3 className="source-card__title">
        <Link to={`/study-materials/${material.id}`} className="source-card__link">
          {material.title}
        </Link>
      </h3>
      {material.updatedAt && (
        <p className="source-card__meta">
          Updated {new Date(material.updatedAt).toLocaleDateString()}
        </p>
      )}
    </article>
  );
}
