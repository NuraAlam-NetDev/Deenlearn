import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { changePassword, updateProfile } from '../../services/studentService.js';
import { formatDate } from '../../utils/format.js';
import { validatePasswordChange, validateProfile } from '../../utils/validators.js';
import Alert from '../../components/Alert.jsx';
import FormField from '../../components/FormField.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader, StatCard } from '../../components/ui/Card.jsx';

function NameForm() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { values, errors, onChange, onBlur, handleSubmit, setServerErrors } = useForm({
    initialValues: { name: user.name },
    validate: validateProfile,
  });

  const unchanged = values.name.trim() === user.name;

  const onSubmit = handleSubmit(async (data) => {
    setFormError('');
    setSaving(true);
    try {
      const res = await updateProfile({ name: data.name.trim() });
      updateUser(res.user);
      toast.success('Your name has been updated.');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setServerErrors(fieldErrors);
      else setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  });

  return (
    <Card>
      <CardHeader title="Your details" />
      <CardBody>
        <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
          {formError && <Alert>{formError}</Alert>}
          <FormField
            label="Name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.name}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={user.email}
            readOnly
            hint="Your email is your login. It cannot be changed here."
          />
          <Button type="submit" loading={saving} disabled={unchanged}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function PasswordForm({ onDone }) {
  const toast = useToast();
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { values, errors, onChange, onBlur, handleSubmit, setServerErrors } = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: validatePasswordChange,
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError('');
    setSaving(true);
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Your password has been changed. Other devices were logged out.');
      onDone(); // empties the form
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setServerErrors(fieldErrors);
      else if (err.response?.status === 400) setServerErrors({ currentPassword: getErrorMessage(err) });
      else setFormError(getErrorMessage(err)); // e.g. too many attempts
      setSaving(false);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
      {formError && <Alert>{formError}</Alert>}
      <FormField
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.currentPassword}
      />
      <FormField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        hint="8 to 72 characters, with a letter and a number."
        value={values.newPassword}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.newPassword}
      />
      <FormField
        label="Repeat new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.confirmPassword}
      />
      <Button type="submit" loading={saving}>
        {saving ? 'Changing…' : 'Change password'}
      </Button>
    </form>
  );
}

// /student/profile
export default function Profile() {
  const { user } = useAuth();
  const { data: stats } = useFetch('/enrollments/summary');
  const [passwordFormKey, setPasswordFormKey] = useState(0);
  const initial = user.name?.trim()?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-800">Profile</h1>

      <Card>
        <CardBody className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-500 font-display text-3xl font-bold text-brand-950"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="break-words font-display text-2xl font-bold text-brand-800" dir="auto">
              {user.name}
            </p>
            <p className="ltr-isolate truncate text-sm text-slate-500">{user.email}</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Badge tone="green">Student</Badge>
              {user.createdAt && <span>Member since {formatDate(user.createdAt)}</span>}
            </p>
          </div>
        </CardBody>
      </Card>

      {stats && stats.enrolledCourses > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Courses enrolled" value={stats.enrolledCourses} />
          <StatCard label="Courses completed" value={stats.completedCourses} />
          <StatCard label="Lessons completed" value={stats.completedLessons} />
          <StatCard label="Bookmarks" value={stats.bookmarks} />
        </div>
      )}

      <NameForm />

      <Card>
        <CardHeader title="Change password" subtitle="You will stay logged in here. Your other devices will be logged out." />
        <CardBody>
          <PasswordForm key={passwordFormKey} onDone={() => setPasswordFormKey((k) => k + 1)} />
        </CardBody>
      </Card>
    </div>
  );
}
