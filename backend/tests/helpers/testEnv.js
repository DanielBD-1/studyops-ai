export const testEnv = {
  NODE_ENV: 'test',
  PORT: '3001',
  SUPABASE_URL: 'https://example-project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key-not-real',
  SUPABASE_ANON_KEY: 'mock-anon-key-not-real',
  FRONTEND_URL: 'http://localhost:5173',
  DOCUMENT_SERVICE_URL: 'http://localhost:3002',
};

export function applyTestEnv() {
  Object.assign(process.env, testEnv);
}
