import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch.js';
import { useForm } from '../../hooks/useForm.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import {
  createCourse,
  deleteThumbnail,
  updateCourse,
  uploadThumbnail,
} from '../../services/teacherService.js';
import Alert from '../../components/Alert.jsx';
import FileUploader from '../../components/FileUploader.jsx';
import FormField from '../../components/FormField.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import TextAreaField from '../../components/ui/TextAreaField.jsx';
import { Spinner } from '../../components/Spinner.jsx';

const CATEGORIES = ['quran', 'hadith', 'fiqh', 'aqeedah', 'seerah', 'arabic', 'general'];

// Same limits as the server (server/src/validators/course.js)
function validateCourse({ title, category, description }) {
  const errors = {};
  const t = title.trim();
  if (!t) errors.title = 'Title is required';
  else if (t.length < 3) errors.title = 'Title is too short (at least 3 characters)';
  else if (t.length > 150) errors.title = 'Title must be at most 150 characters';

  if (!category.trim()) errors.category = 'Category is required';
  else if (category.trim().length > 50) errors.category = 'Category must be at most 50 characters';

  if (description.trim().length > 5000) errors.description = 'Description must be at most 5000 characters';
  return errors;
}

// Cover image: saved immediately (it is its own request), so it lives outside the main form.
function CoverImage({ courseId, initialUrl }) {
  const toast = useToast();
  const [url, setUrl] = useState(initialUrl);
  const [removing, setRemoving] = useState(false);

  async function handleUpload(file, options) {
    const { course } = await uploadThumbnail(courseId, file, options);
    setUrl(course.thumbnail);
    toast.success('Cover image updated');
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await deleteThumbnail(courseId);
      setUrl('');
      toast.success('Cover image removed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h2 className="font-display text-xl font-bold text-brand-800">Cover image</h2>
      {url && (
        <div className="flex items-center gap-3">
          <img src={url} alt="Current cover" className="aspect-video w-40 rounded-lg object-cover" />
          <Button variant="outline" size="sm" loading={removing} onClick={handleRemove}>
            Remove
          </Button>
        </div>
      )}
      <FileUploader
        accept="image/*"
        multiple={false}
        label={url ? 'Replace image' : 'Upload image'}
        hint="JPG, PNG, WEBP or GIF"
        onUpload={handleUpload}
      />
    </Card>
  );
}

function CourseFormBody({ course }) {
  const toast = useToast();
  const navigate = useNavigate();
  const editing = !!course;
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const { values, errors, onChange, onBlur, handleSubmit, setServerErrors } = useForm({
    initialValues: {
      title: course?.title ?? '',
      category: course?.category ?? 'general',
      description: course?.description ?? '',
    },
    validate: validateCourse,
  });

  async function submit(v) {
    setFormError('');
    setSaving(true);
    const body = { title: v.title.trim(), category: v.category.trim(), description: v.description.trim() };
    try {
      if (editing) {
        await updateCourse(course._id, body);
        toast.success('Course saved');
        navigate(`/teacher/courses/${course._id}`);
      } else {
        const { course: created } = await createCourse(body);
        toast.success('Course created. Now add its lessons.');
        navigate(`/teacher/courses/${created._id}`);
      }
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setServerErrors(fields);
      else setFormError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {editing && <CoverImage courseId={course._id} initialUrl={course.thumbnail} />}

      <Card className="p-5">
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          {formError && <Alert>{formError}</Alert>}

          <FormField
            label="Title"
            name="title"
            value={values.title}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.title}
            maxLength={150}
            autoFocus={!editing}
          />

          <div>
            <FormField
              label="Category"
              name="category"
              list="course-categories"
              value={values.category}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.category}
              hint="Pick one or type your own."
              dir="ltr"
              maxLength={50}
            />
            <datalist id="course-categories">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <TextAreaField
            label="Description"
            name="description"
            rows={6}
            value={values.description}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.description}
            hint="What will students learn? Shown on the course page."
          />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link
              to={editing ? `/teacher/courses/${course._id}` : '/teacher/courses'}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-brand-700 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 sm:h-10 sm:text-base"
            >
              Cancel
            </Link>
            <Button type="submit" loading={saving}>
              {editing ? 'Save changes' : 'Create course'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// /teacher/courses/new  and  /teacher/courses/:id/edit
export default function CourseForm() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(id ? `/teacher/courses/${id}` : null);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold text-brand-800">{id ? 'Edit course' : 'New course'}</h1>
      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}
      {!id && <CourseFormBody />}
      {id && data && <CourseFormBody course={data.course} />}
    </div>
  );
}
