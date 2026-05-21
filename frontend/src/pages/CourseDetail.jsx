import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
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
import { createStudyMaterialFormSchema, updateCourseFormSchema } from '../utils/validation.js';

export default function CourseDetail() {
  const { id } = useParams();
  const { logout } = useAuth();
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
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        <LoadingState message="Loading course…" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Course not found</h1>
        <p style={{ color: '#555' }}>This course may have been deleted.</p>
        <Link to="/courses">Back to courses</Link>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        <ErrorMessage message={error ?? 'Failed to load course'} />
        <Button variant="secondary" onClick={loadCourse}>
          Try again
        </Button>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/courses">Back to courses</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <p style={{ margin: '0 0 1rem' }}>
        <Link to="/courses">← Back to courses</Link>
      </p>

      <h1 style={{ margin: '0 0 1.5rem' }}>{course.title}</h1>

      <FormCard title="Edit course">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem' }}>Study materials</h2>

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
          <div style={{ marginBottom: '1rem' }}>
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}

        {!showCreateMaterial && (materials.length > 0 || materialsError) && (
          <Button variant="primary" onClick={() => setShowCreateMaterial(true)}>
            Add study material
          </Button>
        )}

        {showCreateMaterial && (
          <div style={{ marginTop: '1rem' }}>
            <FormCard title="Add study material">
              <form
                onSubmit={handleCreateMaterial}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <Input
                  id="material-title-create"
                  label="Title"
                  value={materialTitle}
                  onChange={setMaterialTitle}
                  required
                />
                <label htmlFor="material-source-type-create" style={{ display: 'block' }}>
                  Source type
                  <select
                    id="material-source-type-create"
                    value={materialSourceType}
                    onChange={(e) =>
                      setMaterialSourceType(/** @type {'manual' | 'paste'} */ (e.target.value))
                    }
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: '0.25rem',
                      padding: '0.5rem',
                      boxSizing: 'border-box',
                    }}
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
                  required
                />
                {createMaterialError && <ErrorMessage message={createMaterialError} />}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>Danger zone</h2>
        {deleteError && <ErrorMessage message={deleteError} />}
        <Button variant="danger" disabled={saving || deleting} onClick={handleDelete}>
          {deleting ? 'Deleting…' : 'Delete course'}
        </Button>
      </section>
    </main>
  );
}
