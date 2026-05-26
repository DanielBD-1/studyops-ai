import Button from '../ui/Button.jsx';
import FlashcardStudy from './FlashcardStudy.jsx';
import FormCard from '../ui/FormCard.jsx';

/**
 * @param {{
 *   plan: import('../../services/study-materials.service.js').StudyPlan,
 *   savedAt?: string | null,
 *   onClear: () => void,
 *   clearDisabled?: boolean,
 *   clearing?: boolean,
 *   onImport?: () => void,
 *   importDisabled?: boolean,
 *   importing?: boolean,
 *   importProgress?: string | null,
 *   onImportFlashcards?: () => void,
 *   importFlashcardsDisabled?: boolean,
 *   importingFlashcards?: boolean,
 *   importFlashcardsProgress?: string | null,
 * }} props
 */
export default function GeneratedPlanSection({
  plan,
  savedAt = null,
  onClear,
  clearDisabled = false,
  clearing = false,
  onImport,
  importDisabled = false,
  importing = false,
  importProgress = null,
  onImportFlashcards,
  importFlashcardsDisabled = false,
  importingFlashcards = false,
  importFlashcardsProgress = null,
}) {
  if (!plan || typeof plan.summary !== 'string') {
    return (
      <FormCard title="Generated study plan" ai>
        <p className="plan-block__body">Could not display plan.</p>
      </FormCard>
    );
  }

  const keyTopics = Array.isArray(plan.keyTopics) ? plan.keyTopics : [];
  const tasks = Array.isArray(plan.tasks) ? plan.tasks : [];
  const flashcards = Array.isArray(plan.flashcards) ? plan.flashcards : [];

  return (
    <div className="plan-fade-in">
      <FormCard title="Generated study plan" ai>
        <p className="plan-disclaimer">
          AI-generated — saved as the latest plan for this material. Reference only; verify
          before you study.
        </p>
        {savedAt ? (
          <p className="plan-saved-at">
            Last saved: {new Date(savedAt).toLocaleString()}
          </p>
        ) : null}

        <section className="plan-block">
          <h3 className="plan-block__title">Summary</h3>
          <p className="plan-block__body">{plan.summary}</p>
        </section>

        {keyTopics.length > 0 && (
          <section className="plan-block">
            <h3 className="plan-block__title">Key topics</h3>
            <ul className="plan-block__list">
              {keyTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </section>
        )}

        {plan.difficulty && (
          <section className="plan-block">
            <h3 className="plan-block__title">Difficulty</h3>
            <p className="plan-block__body plan-block__body--capitalize">{plan.difficulty}</p>
          </section>
        )}

        {(tasks.length > 0 && onImport) || (flashcards.length > 0 && onImportFlashcards) ? (
          <p className="section__actions">
            {tasks.length > 0 && onImport ? (
              <Button
                type="button"
                variant="primary"
                onClick={onImport}
                disabled={importDisabled || importing || importingFlashcards}
              >
                {importing ? 'Importing…' : 'Import tasks to course'}
              </Button>
            ) : null}
            {flashcards.length > 0 && onImportFlashcards ? (
              <Button
                type="button"
                variant="primary"
                onClick={onImportFlashcards}
                disabled={importFlashcardsDisabled || importing || importingFlashcards}
              >
                {importingFlashcards ? 'Importing…' : 'Import flashcards to library'}
              </Button>
            ) : null}
            {importing && importProgress ? (
              <span className="plan-panel__status"> {importProgress}</span>
            ) : null}
            {importingFlashcards && importFlashcardsProgress ? (
              <span className="plan-panel__status"> {importFlashcardsProgress}</span>
            ) : null}
          </p>
        ) : null}

        {tasks.length > 0 && (
          <section className="plan-block">
            <h3 className="plan-block__title">Tasks</h3>
            <ol className="plan-block__list">
              {tasks.map((task, index) => (
                <li key={`${task.title}-${index}`} className="plan-block__item">
                  <strong>{task.title}</strong>
                  {task.description ? (
                    <p className="plan-block__body">{task.description}</p>
                  ) : null}
                  <p className="plan-block__meta">
                    {[
                      task.priority ? `Priority: ${task.priority}` : null,
                      task.estimatedMinutes != null
                        ? `Estimated: ${task.estimatedMinutes} min`
                        : null,
                      task.difficulty ? `Difficulty: ${task.difficulty}` : null,
                      Array.isArray(task.tags) && task.tags.length > 0
                        ? `Tags: ${task.tags.join(', ')}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {flashcards.length > 0 && <FlashcardStudy flashcards={flashcards} />}

        <div className="form-row">
          <Button
            variant="secondary"
            onClick={onClear}
            disabled={clearDisabled || importing || importingFlashcards}
          >
            {clearing ? 'Clearing…' : 'Clear plan'}
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
