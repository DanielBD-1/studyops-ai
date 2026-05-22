import Button from '../ui/Button.jsx';
import FormCard from '../ui/FormCard.jsx';

/**
 * @param {{
 *   plan: import('../../services/study-materials.service.js').StudyPlan,
 *   onClear: () => void,
 *   clearDisabled?: boolean,
 * }} props
 */
export default function GeneratedPlanSection({ plan, onClear, clearDisabled = false }) {
  if (!plan || typeof plan.summary !== 'string') {
    return (
      <FormCard title="Generated study plan">
        <p style={{ color: '#555', margin: 0 }}>Could not display plan.</p>
      </FormCard>
    );
  }

  const keyTopics = Array.isArray(plan.keyTopics) ? plan.keyTopics : [];
  const tasks = Array.isArray(plan.tasks) ? plan.tasks : [];
  const flashcards = Array.isArray(plan.flashcards) ? plan.flashcards : [];

  return (
    <FormCard title="Generated study plan">
      <section style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem' }}>Summary</h3>
        <p style={{ margin: 0, lineHeight: 1.5 }}>{plan.summary}</p>
      </section>

      {keyTopics.length > 0 && (
        <section style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem' }}>Key topics</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {keyTopics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>
      )}

      {plan.difficulty && (
        <section style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem' }}>Difficulty</h3>
          <p style={{ margin: 0, textTransform: 'capitalize' }}>{plan.difficulty}</p>
        </section>
      )}

      {tasks.length > 0 && (
        <section style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem' }}>Tasks</h3>
          <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {tasks.map((task, index) => (
              <li key={`${task.title}-${index}`} style={{ marginBottom: '0.75rem' }}>
                <strong>{task.title}</strong>
                {task.description ? (
                  <p style={{ margin: '0.25rem 0 0', lineHeight: 1.5 }}>{task.description}</p>
                ) : null}
                <p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '0.9rem' }}>
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

      {flashcards.length > 0 && (
        <section style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem' }}>Flashcards</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {flashcards.map((card, index) => (
              <li key={`${card.question}-${index}`} style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: 0 }}>
                  <strong>Q:</strong> {card.question}
                </p>
                <p style={{ margin: '0.25rem 0 0' }}>
                  <strong>A:</strong> {card.answer}
                </p>
                {Array.isArray(card.tags) && card.tags.length > 0 ? (
                  <p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '0.9rem' }}>
                    Tags: {card.tags.join(', ')}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Button variant="secondary" onClick={onClear} disabled={clearDisabled}>
        Clear plan
      </Button>
    </FormCard>
  );
}
