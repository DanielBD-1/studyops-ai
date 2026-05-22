import RegisterForm from '../components/auth/RegisterForm.jsx';
import FormCard from '../components/ui/FormCard.jsx';

export default function RegisterPage() {
  return (
    <main className="page page--auth">
      <h1>Create account</h1>
      <p className="page__lead">Student registration only</p>
      <FormCard>
        <RegisterForm />
      </FormCard>
    </main>
  );
}
