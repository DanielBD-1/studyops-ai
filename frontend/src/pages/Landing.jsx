import LoginForm from '../components/auth/LoginForm.jsx';
import FormCard from '../components/ui/FormCard.jsx';

export default function Landing() {
  return (
    <main className="page page--auth">
      <header className="auth-brand">
        <p className="auth-brand__tagline">AI study workspace</p>
        <h1>StudyOps AI</h1>
        <p className="page__lead">Sign in to organize courses, materials, and study plans.</p>
      </header>
      <FormCard>
        <LoginForm />
      </FormCard>
    </main>
  );
}
