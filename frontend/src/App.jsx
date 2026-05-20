import { getEnv } from './config/env.js';

/**
 * Phase 1B — env validated at module load; Supabase client prepared in lib/supabase.js (unused until auth phase).
 * No auth UI or routes in this phase.
 */
const env = getEnv();

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>StudyOps AI</h1>
      <p>Phase 1B — Supabase &amp; environment setup</p>
      <p>
        Backend API base: <code>{env.VITE_API_URL}</code>
      </p>
      <p style={{ color: '#555' }}>
        Health: <code>{env.VITE_API_URL}/health</code> (when backend is running)
      </p>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        Supabase URL configured (anon client ready; auth UI not implemented yet).
      </p>
    </main>
  );
}
