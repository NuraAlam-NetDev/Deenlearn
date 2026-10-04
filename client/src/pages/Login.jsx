import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../services/api.js';
import FormField from '../components/FormField.jsx';
import Alert from '../components/Alert.jsx';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      // GuestRoute redirects automatically once the user is set
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={onChange}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={onChange}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-brand-700 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-medium text-brand-600 underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}