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
    <form onSubmit={handleSubmit} className="form-stack">
      <label className="field">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="field__input"
        />
      </label>
      <label className="field">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          className="field__input"
        />
      </label>
      <label className="field">
        Confirm password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          className="field__input"
        />
      </label>
      {authNotice && (
        <p role="status" className="alert alert--success">
          {authNotice}
        </p>
      )}
      {error && (
        <p role="alert" className="alert alert--error">
          {error}
        </p>
      )}
      <button type="submit" disabled={submitting} className="btn btn--primary">
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
      <p className="auth-footer">
        Already have an account? <Link to="/">Sign in</Link>
      </p>
    </form>
  );
}
