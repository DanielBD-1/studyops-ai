import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';

const COURSE_COLUMNS = 'id, title, created_at, updated_at';

const TITLE_VALIDATION_MESSAGE = 'Course title must be between 3 and 100 characters';

/**
 * @param {{ id: string, title: string, created_at: string, updated_at: string }} row
 */
export function mapCourse(row) {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {{ code?: string, message?: string } | null} error
 */
function handleCourseError(error) {
  if (!error) return;

  if (error.code === 'PGRST116') {
    throw new ApiError('NOT_FOUND', 'Course not found', 404);
  }

  if (error.code === '23514') {
    throw new ApiError('VALIDATION_ERROR', TITLE_VALIDATION_MESSAGE, 400);
  }

  throw new ApiError('DATABASE_ERROR', 'Failed to access course', 500);
}

/**
 * @param {string} userId
 */
export async function listCourses(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('courses')
    .select(COURSE_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to list courses', 500);
  }

  return (data ?? []).map(mapCourse);
}

/**
 * @param {string} userId
 * @param {string} title
 */
export async function createCourse(userId, title) {
  const { data, error } = await getSupabaseAdmin()
    .from('courses')
    .insert({ user_id: userId, title })
    .select(COURSE_COLUMNS)
    .single();

  if (error) {
    handleCourseError(error);
  }

  return mapCourse(data);
}

/**
 * @param {string} userId
 * @param {string} courseId
 */
export async function getCourseById(userId, courseId) {
  const { data, error } = await getSupabaseAdmin()
    .from('courses')
    .select(COURSE_COLUMNS)
    .eq('id', courseId)
    .eq('user_id', userId)
    .single();

  if (error) {
    handleCourseError(error);
  }

  return {
    course: mapCourse(data),
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      totalFlashcards: 0,
    },
  };
}

/**
 * @param {string} userId
 * @param {string} courseId
 * @param {string} title
 */
export async function updateCourse(userId, courseId, title) {
  const { data, error } = await getSupabaseAdmin()
    .from('courses')
    .update({ title })
    .eq('id', courseId)
    .eq('user_id', userId)
    .select(COURSE_COLUMNS)
    .single();

  if (error) {
    handleCourseError(error);
  }

  return mapCourse(data);
}

/**
 * @param {string} userId
 * @param {string} courseId
 */
export async function deleteCourse(userId, courseId) {
  const { data, error } = await getSupabaseAdmin()
    .from('courses')
    .delete()
    .eq('id', courseId)
    .eq('user_id', userId)
    .select('id')
    .single();

  if (error) {
    handleCourseError(error);
  }

  return { deleted: true, id: data.id };
}
