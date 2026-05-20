import RegisterForm from '../components/auth/RegisterForm.jsx';

export default function RegisterPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 420, margin: '0 auto' }}>
      <h1>Create account</h1>
      <p style={{ color: '#555' }}>Student registration only</p>
      <RegisterForm />
    </main>
  );
}
