import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getErrorMessage } from '../services/api.js';
import FormField from '../components/FormField.jsx';
import Alert from '../components/Alert.jsx';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      // GuestRoute redirects automatically once the user is set
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-brand-700">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <FormField
          label="Name"
          name="name"
          autoComplete="name"
          required
          value={form.name}
          onChange={onChange}
        />
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
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters, with a letter and a number."
          value={form.password}
          onChange={onChange}
        />

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-slate-700">I want to</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="student"
                checked={form.role === 'student'}
                onChange={onChange}
              />
              Learn (student)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={form.role === 'teacher'}
                onChange={onChange}
              />
              Teach
            </label>
          </div>
          {form.role === 'teacher' && (
            <p className="mt-2 text-xs text-amber-700">
              Teacher accounts need admin approval before you can publish courses.
            </p>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-brand-700 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-brand-600 underline">
          Login
        </Link>
      </p>
    </div>
  );
}