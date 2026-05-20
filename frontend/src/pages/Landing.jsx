import LoginForm from '../components/auth/LoginForm.jsx';

export default function Landing() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 420, margin: '0 auto' }}>
      <h1>StudyOps AI</h1>
      <p style={{ color: '#555' }}>Sign in to continue</p>
      <LoginForm />
    </main>
  );
}
