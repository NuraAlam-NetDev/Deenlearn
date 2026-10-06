import { useEffect, useState } from 'react';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import { saveNote } from '../../services/studentService.js';
import { formatDateTime } from '../../utils/format.js';
import Alert from '../Alert.jsx';
import Button from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/Modal.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import TextAreaField from '../ui/TextAreaField.jsx';

const MAX = 8000; // same as the server

function NoteEditor({ lessonId, initial }) {
  const toast = useToast();
  const [text, setText] = useState(initial.content);
  const [saved, setSaved] = useState(initial); // { content, updatedAt } as stored on the server
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = text.trim() !== saved.content;

  // the browser's own "leave this page?" prompt while there are unsaved words
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function save(value = text) {
    setSaving(true);
    try {
      const { note } = await saveNote(lessonId, value);
      setSaved(note ?? { content: '', updatedAt: null });
      if (!note) setText('');
      toast.success(note ? 'Note saved.' : 'Note deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <TextAreaField
        label="Your private note for this lesson"
        hint="Only you can see this. Press Ctrl+Enter (or Cmd+Enter) to save."
        rows={8}
        value={text}
        maxLength={MAX}
        placeholder="Write what you want to remember…"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && dirty && !saving) {
            e.preventDefault();
            save();
          }
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => save()} loading={saving} disabled={!dirty}>
          Save note
        </Button>
        {saved.content && (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)} disabled={saving}>
            Delete note
          </Button>
        )}
        <p className="text-xs text-slate-500 sm:ms-auto" aria-live="polite">
          {dirty ? 'Unsaved changes · ' : saved.updatedAt ? `Saved ${formatDateTime(saved.updatedAt)} · ` : ''}
          {text.length} / {MAX}
        </p>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this note?"
        message="Your note for this lesson will be removed. This cannot be undone."
        confirmLabel="Delete note"
        danger
        onConfirm={async () => {
          await save('');
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

// The student's private note on one lesson
export default function NotesPanel({ lessonId }) {
  const { data, loading, error } = useFetch(`/lessons/${lessonId}/note`);

  if (loading && !data) return <Skeleton className="h-48 w-full" />;
  if (error || !data) return <Alert>{error || 'Could not load your note.'}</Alert>;

  return (
    <NoteEditor
      lessonId={lessonId}
      initial={data.note ?? { content: '', updatedAt: null }}
    />
  );
}
