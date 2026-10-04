import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useForm } from '../hooks/useForm.js';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { validateLogin } from '../utils/validators.js';
import FormField from '../components/FormField.jsx';
import Alert from '../components/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';

export default function Login() {
  const { login } = useAuth();
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { values, errors, onChange, onBlur, handleSubmit, setServerErrors } = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError('');
    setSubmitting(true);
    try {
      await login({ email: data.email.trim(), password: data.password });
      // GuestRoute redirects automatically once the user is set
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setServerErrors(fieldErrors);
      else setFormError(getErrorMessage(err)); // e.g. wrong password, banned account
      setSubmitting(false);
    }
  });

  return (
    <Card className="mx-auto max-w-md">
      <CardBody className="sm:p-8">
        <h1 className="mb-1 text-3xl font-bold text-brand-800">Welcome back</h1>
        <p className="mb-5 text-sm text-slate-500">Login to continue learning.</p>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {formError && <Alert>{formError}</Alert>}
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.email}
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.password}
          />
          <Button type="submit" full loading={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-600 underline">
            Create an account
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
