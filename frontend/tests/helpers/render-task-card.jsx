import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import TaskCard from '../../src/components/tasks/TaskCard.jsx';
import { flushUpdates, installMinimalBrowser } from './minimal-browser.js';

/**
 * @param {{
 *   task: import('../../src/services/tasks.service.js').StudyTask,
 *   todayIso?: string,
 * }} options
 */
export async function renderTaskCardHarness(options) {
  const { task } = options;
  const browser = installMinimalBrowser();
  const root = createRoot(browser.container);

  await act(async () => {
    root.render(
      <MemoryRouter>
        <TaskCard
          task={task}
          onEdit={() => {}}
          onComplete={() => {}}
          onDelete={() => {}}
          editing={false}
          completing={false}
          deleting={false}
          materialLabel={null}
          disabled={false}
        />
      </MemoryRouter>
    );
  });
  await flushUpdates();
  await flushUpdates();

  return {
    container: browser.container,
    getDueDateLine() {
      return browser.container.querySelector('.task-card__due-date');
    },
    getDueDateTime() {
      const dueDateLine = browser.container.querySelector('.task-card__due-date');
      return dueDateLine?.querySelector('time') ?? null;
    },
    async unmount() {
      await act(async () => {
        root.unmount();
      });
      await flushUpdates();
      browser.cleanup();
    },
  };
}
