import { createTasksMockSupabaseClient, getMockTasks } from './mockSupabaseTasks.js';
import { createFlashcardsBuilder } from './mockSupabaseFlashcards.js';

export {
  TEST_USER_ID,
  OWN_COURSE_ID,
  OTHER_USER_COURSE_ID,
  OWN_MATERIAL_ID,
  OTHER_USER_MATERIAL_ID,
} from './mockSupabaseStudyMaterials.js';

export { getMockTasks };

export { getMockFlashcards } from './mockSupabaseFlashcards.js';

export function createPlanImportMockSupabaseClient() {
  const tasksClient = createTasksMockSupabaseClient();
  const tasksFrom = tasksClient.from.bind(tasksClient);

  return {
    ...tasksClient,
    from(table) {
      if (table === 'flashcards') {
        return createFlashcardsBuilder();
      }
      return tasksFrom(table);
    },
  };
}
