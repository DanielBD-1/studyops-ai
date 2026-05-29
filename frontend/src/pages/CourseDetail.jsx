import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboardRefresh } from '../context/DashboardContext.jsx';
import MaterialCard from '../components/materials/MaterialCard.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import FormCard from '../components/ui/FormCard.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import {
  ApiRequestError,
  getCourse,
  updateCourse,
  deleteCourse,
} from '../services/courses.service.js';
import { createMaterial, listMaterials } from '../services/study-materials.service.js';
import CourseTasksSection from '../components/tasks/CourseTasksSection.jsx';
import { createStudyMaterialFormSchema, updateCourseFormSchema } from '../utils/validation.js';

export default function CourseDetail() {
  const { id } = useParams();
  const { logout } = useAuth();
  const { refreshStats } = useDashboardRefresh();
  const navigate = useNavigate();

  const [course, setCourse] = useState(
    /** @type {import('../services/courses.service.js').Course | null} */ (null)
  );
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [notFound, setNotFound] = useState(false);
  const [saveError, setSaveError] = useState(/** @type {string | null} */ (null));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(/** @type {string | null} */ (null));

  const [materials, setMaterials] = useState(
    /** @type {import('../services/study-materials.service.js').MaterialSummary[]} */ ([])
  );
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState(/** @type {string | null} */ (null));
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');
  const [materialSourceType, setMaterialSourceType] = useState(
    /** @type {'manual' | 'paste'} */ ('manual')
  );
  const [createMaterialError, setCreateMaterialError] = useState(/** @type {string | null} */ (null));
  const [creatingMaterial, setCreatingMaterial] = useState(false);

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

  const loadMaterials = useCallback(async () => {
    if (!id) return;

    setMaterialsLoading(true);
    setMaterialsError(null);

    try {
      const data = await listMaterials(id);
      setMaterials(data.materials);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setMaterialsError(
        err instanceof Error ? err.message : 'Failed to load study materials'
      );
    } finally {
      setMaterialsLoading(false);
    }
  }, [id, handleAuthError]);

  const loadCourse = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await getCourse(id);
      setCourse(data.course);
      setTitle(data.course.title);
      await loadMaterials();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id, handleAuthError, loadMaterials]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  async function handleSave(event) {
    event.preventDefault();
    if (!id) return;
    setSaveError(null);

    const parsed = updateCourseFormSchema.safeParse({ title });
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setSaving(true);
    try {
      const data = await updateCourse(id, parsed.data);
      setCourse(data.course);
      setTitle(data.course.title);
      refreshStats();
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setSaveError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !course) return;
    const confirmed = window.confirm(`Delete "${course.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteCourse(id);
      refreshStats();
      navigate('/courses');
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  }

  async function handleCreateMaterial(event) {
    event.preventDefault();
    if (!id) return;
    setCreateMaterialError(null);

    const parsed = createStudyMaterialFormSchema.safeParse({
      title: materialTitle,
      content: materialContent,
      sourceType: materialSourceType,
    });
    if (!parsed.success) {
      setCreateMaterialError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setCreatingMaterial(true);
    try {
      const data = await createMaterial(id, parsed.data);
      setMaterialTitle('');
      setMaterialContent('');
      setMaterialSourceType('manual');
      setShowCreateMaterial(false);
      refreshStats();
      navigate(`/study-materials/${data.material.id}`);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setCreateMaterialError(
        err instanceof Error ? err.message : 'Failed to create study material'
      );
    } finally {
      setCreatingMaterial(false);
    }
  }

  if (loading) {
    return (
      <main className="page page--workspace">
        <LoadingState message="Loading course…" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page page--workspace">
        <h1 className="page__title--tight">Course not found</h1>
        <p className="not-found__text">This course may have been deleted.</p>
        <Link to="/courses">Back to courses</Link>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="page page--workspace">
        <ErrorMessage message={error ?? 'Failed to load course'} />
        <Button variant="secondary" onClick={loadCourse}>
          Try again
        </Button>
        <p className="section__actions">
          <Link to="/courses">Back to courses</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="page page--workspace">
      <p className="back-link">
        <Link to="/courses">← Back to courses</Link>
      </p>

      <h1 className="page__title--tight">{course.title}</h1>

      <FormCard title="Edit course">
        <form onSubmit={handleSave} className="form-stack">
          <Input
            id="course-title-edit"
            label="Course title"
            value={title}
            onChange={setTitle}
            error={saveError}
            required
          />
          <Button type="submit" variant="primary" disabled={saving || deleting}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </FormCard>

      <section className="section">
        <h2 className="section__title">Study materials</h2>

        {materialsLoading && <LoadingState message="Loading study materials…" />}

        {!materialsLoading && materialsError && (
          <>
            <ErrorMessage message={materialsError} />
            <Button variant="secondary" onClick={loadMaterials}>
              Try again
            </Button>
          </>
        )}

        {!materialsLoading && !materialsError && materials.length === 0 && !showCreateMaterial && (
          <EmptyState
            headline="No study materials yet"
            description="Add pasted notes or text for this course."
            actionLabel="Add study material"
            onAction={() => setShowCreateMaterial(true)}
          />
        )}

        {!materialsLoading && !materialsError && materials.length > 0 && (
          <div className="card-list">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}

        {!showCreateMaterial && (materials.length > 0 || materialsError) && (
          <p className="section__actions">
            <Button variant="primary" onClick={() => setShowCreateMaterial(true)}>
              Add study material
            </Button>
          </p>
        )}

        {showCreateMaterial && (
          <div className="section--compact">
            <FormCard title="Add study material">
              <form onSubmit={handleCreateMaterial} className="form-stack">
                <Input
                  id="material-title-create"
                  label="Title"
                  value={materialTitle}
                  onChange={setMaterialTitle}
                  required
                />
                <label htmlFor="material-source-type-create" className="field">
                  Source type
                  <select
                    id="material-source-type-create"
                    value={materialSourceType}
                    onChange={(e) =>
                      setMaterialSourceType(/** @type {'manual' | 'paste'} */ (e.target.value))
                    }
                    className="field__select"
                  >
                    <option value="manual">Manual entry</option>
                    <option value="paste">Pasted text</option>
                  </select>
                </label>
                <Textarea
                  id="material-content-create"
                  label="Study material"
                  value={materialContent}
                  onChange={setMaterialContent}
                  rows={10}
                  reading
                  required
                />
                {createMaterialError && <ErrorMessage message={createMaterialError} />}
                <div className="form-row">
                  <Button type="submit" variant="primary" disabled={creatingMaterial}>
                    {creatingMaterial ? 'Creating…' : 'Create study material'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={creatingMaterial}
                    onClick={() => {
                      setShowCreateMaterial(false);
                      setCreateMaterialError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </FormCard>
          </div>
        )}
      </section>

      <CourseTasksSection
        courseId={id}
        materials={materials}
        handleAuthError={handleAuthError}
      />

      <section className="danger-zone">
        <h2 className="danger-zone__title">Danger zone</h2>
        {deleteError && <ErrorMessage message={deleteError} />}
        <Button variant="danger" disabled={saving || deleting} onClick={handleDelete}>
          {deleting ? 'Deleting…' : 'Delete course'}
        </Button>
      </section>
    </main>
  );
}
