import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { registerFormSchema } from '../../utils/validation.js';

export default function RegisterForm() {
  const { register, authNotice } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const parsed = registerFormSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (result.needsEmailConfirmation) {
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
        />
      </label>
      <label>
        Confirm password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem' }}
        />
      </label>
      {authNotice && (
        <p role="status" style={{ color: '#0d5c2e', margin: 0 }}>
          {authNotice}
        </p>
      )}
      {error && <p role="alert" style={{ color: '#b00020', margin: 0 }}>{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>
        Already have an account? <Link to="/">Sign in</Link>
      </p>
    </form>
  );
}
