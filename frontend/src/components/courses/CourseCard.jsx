import { Link } from 'react-router-dom';

/**
 * @param {{ course: { id: string, title: string, createdAt?: string } }} props
 */
export default function CourseCard({ course }) {
  return (
    <article className="source-card">
      <h2 className="source-card__title">
        <Link to={`/courses/${course.id}`} className="source-card__link">
          {course.title}
        </Link>
      </h2>
      {course.createdAt && (
        <p className="source-card__meta">
          Created {new Date(course.createdAt).toLocaleDateString()}
        </p>
      )}
    </article>
  );
}
