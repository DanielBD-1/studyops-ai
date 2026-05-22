import LoginForm from '../components/auth/LoginForm.jsx';
import FormCard from '../components/ui/FormCard.jsx';

export default function Landing() {
  return (
    <main className="page page--auth">
      <h1>StudyOps AI</h1>
      <p className="page__lead">Sign in to continue</p>
      <FormCard>
        <LoginForm />
      </FormCard>
    </main>
  );
}
