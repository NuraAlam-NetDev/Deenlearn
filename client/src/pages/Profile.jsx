import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { changePassword, updateProfile } from '../../services/studentService.js';
import { validatePasswordChange, validateProfile } from '../../utils/validators.js';
import Alert from '../../components/Alert.jsx';
import FormField from '../../components/FormField.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, StatCard } from '../../components/ui/Card.jsx';

function ProfileForm() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { values, errors, onChange, onBlur, handleSubmit, setServerErrors } = useForm({
    initialValues: { name: user.name },
    validate: validateProfile,
  });

  async function submit(v) {
    setFormError('');
    setSaving(true);
    try {
      const data = await updateProfile({ name: v.name.trim() });
      updateUser(data.user); // sidebar and greeting pick up the new name
      toast.success('Profile updated');
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setServerErrors(fields);
      else setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const unchanged = values.name.trim() === user.name;

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-display text-xl font-bold text-brand-800">Your details</h2>
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
        {formError && <Alert>{formError}</Alert>}
        <FormField label="Name" name="name" value={values.name} onChange={onChange} onBlur={onBlur} error={errors.name} maxLength={100} autoComplete="name" />
        <FormField label="Email" type="email" value={user.email} readOnly hint="Your email is your login and cannot be changed here." />
        <p className="text-sm text-slate-500">
          Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex justify-end">
          <Button type="submit" loading={saving} disabled={unchanged}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordForm({ onDone }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { values, errors, onChange, onBlur, handleSubmit, setServerErrors } = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: validatePasswordChange,
  });

  async function submit(v) {
    setFormError('');
    setSaving(true);
    try {
      await changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword });
      toast.success('Password changed. Other devices were signed out.');
      onDone(); // empties the form
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setServerErrors(fields);
      else setFormError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {formError && <Alert>{formError}</Alert>}
      <FormField label="Current password" type="password" name="currentPassword" autoComplete="current-password" value={values.currentPassword} onChange={onChange} onBlur={onBlur} error={errors.currentPassword} />
      <FormField
        label="New password"
        type="password"
        name="newPassword"
        autoComplete="new-password"
        value={values.newPassword}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.newPassword}
        hint="At least 8 characters, with a letter and a number."
      />
      <FormField label="Confirm new password" type="password" name="confirmPassword" autoComplete="new-password" value={values.confirmPassword} onChange={onChange} onBlur={onBlur} error={errors.confirmPassword} />
      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          Change password
        </Button>
      </div>
    </form>
  );
}

// /student/profile
export default function Profile() {
  const summary = useFetch('/enrollments/summary');
  const [passwordFormKey, setPasswordFormKey] = useState(0);
  const s = summary.data;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-3xl font-bold text-brand-800">Profile</h1>

      <ProfileForm />

      {s && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Courses joined" value={s.enrolled} hint={`${s.completed} completed`} />
          <StatCard label="Lessons completed" value={s.lessonsCompleted} hint={`${s.bookmarks} bookmarked`} />
        </div>
      )}

      <Card className="p-5">
        <h2 className="mb-4 font-display text-xl font-bold text-brand-800">Change password</h2>
        <PasswordForm key={passwordFormKey} onDone={() => setPasswordFormKey((k) => k + 1)} />
      </Card>
    </div>
  );
}
