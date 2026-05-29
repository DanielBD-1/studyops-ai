import RegisterForm from '../components/auth/RegisterForm.jsx';
import FormCard from '../components/ui/FormCard.jsx';

export default function RegisterPage() {
  return (
    <main className="page page--auth">
      <header className="auth-brand">
        <h1>Create account</h1>
        <p className="page__lead">Student registration only</p>
      </header>
      <FormCard>
        <RegisterForm />
      </FormCard>
    </main>
  );
}
