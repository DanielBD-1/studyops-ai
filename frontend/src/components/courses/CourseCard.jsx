import { Link } from 'react-router-dom';
import { getCourseAccentKey } from '../../utils/course-accent.js';

/**
 * @param {{ course: { id: string, title: string, createdAt?: string } }} props
 */
export default function CourseCard({ course }) {
  const accentKey = getCourseAccentKey({
    courseId: course.id,
    courseTitle: course.title,
  });

  return (
    <article
      className="source-card source-card--subject source-card--course-shelf source-card--navigable"
      data-course-accent={accentKey}
    >
      <div className="source-card__header">
        <span className="source-card__pill">Subject</span>
      </div>
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
