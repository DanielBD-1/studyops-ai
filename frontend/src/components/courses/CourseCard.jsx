import { Link } from 'react-router-dom';

/**
 * @param {{ course: { id: string, title: string, createdAt?: string } }} props
 */
export default function CourseCard({ course }) {
  return (
    <article
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '1rem',
        marginBottom: '0.75rem',
      }}
    >
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
        <Link to={`/courses/${course.id}`} style={{ color: '#1a56db', textDecoration: 'none' }}>
          {course.title}
        </Link>
      </h2>
      {course.createdAt && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
          Created {new Date(course.createdAt).toLocaleDateString()}
        </p>
      )}
    </article>
  );
}
