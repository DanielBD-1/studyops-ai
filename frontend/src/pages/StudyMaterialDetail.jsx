import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import FormCard from '../components/ui/FormCard.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import { ApiRequestError } from '../services/courses.service.js';
import GeneratedPlanSection from '../components/materials/GeneratedPlanSection.jsx';
import {
  getMaterial,
  updateMaterial,
  deleteMaterial,
  generateMaterial,
} from '../services/study-materials.service.js';
import { updateStudyMaterialFormSchema } from '../utils/validation.js';

export default function StudyMaterialDetail() {
  const { materialId } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [material, setMaterial] = useState(
    /** @type {import('../services/study-materials.service.js').MaterialDetail | null} */ (null)
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState(/** @type {'manual' | 'paste'} */ ('manual'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [notFound, setNotFound] = useState(false);
  const [saveError, setSaveError] = useState(/** @type {string | null} */ (null));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(/** @type {string | null} */ (null));
  const [plan, setPlan] = useState(
    /** @type {import('../services/study-materials.service.js').StudyPlan | null} */ (null)
  );
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(/** @type {string | null} */ (null));

  const hasUnsavedChanges =
    material !== null &&
    (title !== material.title ||
      content !== material.content ||
      sourceType !== (material.sourceType === 'paste' ? 'paste' : 'manual'));

  const generateDisabled =
    loading || generating || saving || deleting || hasUnsavedChanges;

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

  const loadMaterial = useCallback(async () => {
    if (!materialId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setPlan(null);
    setGenerateError(null);

    try {
      const data = await getMaterial(materialId);
      setMaterial(data.material);
      setTitle(data.material.title);
      setContent(data.material.content);
      setSourceType(
        data.material.sourceType === 'paste' ? 'paste' : 'manual'
      );
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load study material');
    } finally {
      setLoading(false);
    }
  }, [materialId, handleAuthError]);

  useEffect(() => {
    loadMaterial();
  }, [loadMaterial]);

  async function handleSave(event) {
    event.preventDefault();
    if (!materialId) return;
    setSaveError(null);

    const parsed = updateStudyMaterialFormSchema.safeParse({
      title,
      content,
      sourceType,
    });
    if (!parsed.success) {
      setSaveError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setSaving(true);
    try {
      const data = await updateMaterial(materialId, parsed.data);
      setMaterial(data.material);
      setTitle(data.material.title);
      setContent(data.material.content);
      setSourceType(data.material.sourceType === 'paste' ? 'paste' : 'manual');
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setSaveError(err instanceof Error ? err.message : 'Failed to update study material');
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    if (!materialId || generateDisabled) return;

    setGenerateError(null);
    setGenerating(true);
    try {
      const data = await generateMaterial(materialId);
      setPlan(data.plan);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setGenerateError(
        err instanceof Error ? err.message : 'Failed to generate study plan'
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleClearPlan() {
    setPlan(null);
    setGenerateError(null);
  }

  async function handleDelete() {
    if (!materialId || !material) return;
    const confirmed = window.confirm(
      `Delete "${material.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteMaterial(materialId);
      navigate(`/courses/${material.courseId}`);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError && err.code === 'NOT_FOUND') {
        setNotFound(true);
        return;
      }
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete study material');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        <LoadingState message="Loading study material…" />
      </main>
    );
  }

  if (notFound) {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Study material not found</h1>
        <p style={{ color: '#555' }}>This study material may have been deleted.</p>
        <Link to="/courses">Back to courses</Link>
      </main>
    );
  }

  if (error || !material) {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        <ErrorMessage message={error ?? 'Failed to load study material'} />
        <Button variant="secondary" onClick={loadMaterial}>
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
        <Link to={`/courses/${material.courseId}`}>← Back to course</Link>
      </p>

      <h1 style={{ margin: '0 0 1.5rem' }}>{material.title}</h1>

      <FormCard title="Edit study material">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Input
            id="material-title-edit"
            label="Title"
            value={title}
            onChange={setTitle}
            required
          />
          <label htmlFor="material-source-type" style={{ display: 'block' }}>
            Source type
            <select
              id="material-source-type"
              value={sourceType}
              onChange={(e) =>
                setSourceType(/** @type {'manual' | 'paste'} */ (e.target.value))
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
            id="material-content-edit"
            label="Study material"
            value={content}
            onChange={setContent}
            rows={12}
            required
          />
          {saveError && <ErrorMessage message={saveError} />}
          <Button type="submit" variant="primary" disabled={saving || deleting || generating}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </FormCard>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 0.75rem' }}>Generate study plan</h2>
        {hasUnsavedChanges && (
          <p style={{ color: '#555', margin: '0 0 0.75rem' }}>
            Save changes before generating — generation uses your last saved material.
          </p>
        )}
        {generateError && <ErrorMessage message={generateError} />}
        <Button
          variant="primary"
          disabled={generateDisabled}
          onClick={handleGenerate}
        >
          {generating ? 'Processing with AI…' : 'Generate study plan'}
        </Button>
        {generating && (
          <div style={{ marginTop: '0.75rem' }}>
            <LoadingState message="Processing with AI…" />
          </div>
        )}
      </section>

      {plan && (
        <section style={{ marginTop: '1.5rem' }}>
          <GeneratedPlanSection
            plan={plan}
            onClear={handleClearPlan}
            clearDisabled={generating || saving || deleting}
          />
        </section>
      )}

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>Danger zone</h2>
        {deleteError && <ErrorMessage message={deleteError} />}
        <Button variant="danger" disabled={saving || deleting || generating} onClick={handleDelete}>
          {deleting ? 'Deleting…' : 'Delete study material'}
        </Button>
      </section>
    </main>
  );
}
