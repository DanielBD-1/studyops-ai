import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CourseCard from '../components/courses/CourseCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import FormCard from '../components/ui/FormCard.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { ApiRequestError, listCourses, createCourse } from '../services/courses.service.js';
import { createCourseFormSchema } from '../utils/validation.js';

export default function CoursesList() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState(/** @type {import('../services/courses.service.js').Course[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [title, setTitle] = useState('');
  const [createError, setCreateError] = useState(/** @type {string | null} */ (null));
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleAuthError = useCallback(
    async (err) => {
      if (err instanceof ApiRequestError && err.code === 'AUTH_REQUIRED') {
        await logout();
        navigate('/');
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCourses();
      setCourses(data.courses);
    } catch (err) {
      if (await handleAuthError(err)) return;
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  async function handleCreate(event) {
    event.preventDefault();
    setCreateError(null);

    const parsed = createCourseFormSchema.safeParse({ title });
    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setCreating(true);
    try {
      await createCourse(parsed.data);
      setTitle('');
      setShowCreateForm(false);
      await loadCourses();
    } catch (err) {
      if (await handleAuthError(err)) return;
      setCreateError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setCreating(false);
    }
  }

  function focusCreateForm() {
    setShowCreateForm(true);
    setTimeout(() => document.getElementById('course-title-create')?.focus(), 0);
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>My courses</h1>
        <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>

      {!showCreateForm && (
        <p style={{ marginBottom: '1rem' }}>
          <Button variant="primary" onClick={() => setShowCreateForm(true)}>
            New course
          </Button>
        </p>
      )}

      {showCreateForm && (
        <FormCard title="Create course">
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Input
              id="course-title-create"
              label="Course title"
              value={title}
              onChange={setTitle}
              error={createError}
              required
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button type="submit" variant="primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create course'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={creating}
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError(null);
                  setTitle('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </FormCard>
      )}

      {loading && <LoadingState message="Loading courses…" />}
      {!loading && error && (
        <>
          <ErrorMessage message={error} />
          <Button variant="secondary" onClick={loadCourses}>
            Try again
          </Button>
        </>
      )}

      {!loading && !error && courses.length === 0 && (
        <EmptyState
          headline="No courses yet"
          description="Create a course to organize your study material."
          actionLabel="Create your first course"
          onAction={focusCreateForm}
        />
      )}

      {!loading && !error && courses.length > 0 && (
        <section aria-label="Course list">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </section>
      )}
    </main>
  );
}
