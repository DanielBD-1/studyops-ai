/**
 * Phase 1A scaffold — no routes configured yet (React Router in deps; Foundation adds routes).
 */
export default function App() {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>StudyOps AI</h1>
      <p>Phase 1A — project scaffold</p>
      <p>
        Backend API base: <code>{apiUrl}</code>
      </p>
      <p style={{ color: '#555' }}>
        Health: <code>{apiUrl}/health</code> (after backend is running)
      </p>
    </main>
  );
}
