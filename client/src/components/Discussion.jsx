import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { useToast } from '../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import {
  askQuestion,
  postReply,
  removeQuestion,
  removeReply,
  setReplyAccepted,
} from '../services/discussionService.js';
import { formatDateTime } from '../utils/format.js';
import Alert from './Alert.jsx';
import FormField from './FormField.jsx';
import Badge from './ui/Badge.jsx';
import Button from './ui/Button.jsx';
import EmptyState from './ui/EmptyState.jsx';
import Icon from './ui/Icon.jsx';
import { ConfirmDialog } from './ui/Modal.jsx';
import Pagination from './ui/Pagination.jsx';
import { Skeleton } from './ui/Skeleton.jsx';
import TextAreaField from './ui/TextAreaField.jsx';

const PAGE_SIZE = 10;
const ROLE_BADGE = { teacher: { tone: 'gold', label: 'Teacher' }, admin: { tone: 'gray', label: 'Admin' } };

const chip = (active) =>
  `shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
    active
      ? 'border-brand-700 bg-brand-700 text-white'
      : 'border-brand-200 bg-white text-brand-800 hover:bg-brand-50'
  }`;

function Byline({ author, date }) {
  const badge = ROLE_BADGE[author?.role];
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
      <span className="font-semibold text-slate-700" dir="auto">
        {author?.name ?? 'Deleted user'}
      </span>
      {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      <span>{formatDateTime(date)}</span>
    </p>
  );
}

// ---------- ask a new question ----------
function AskForm({ lessonId, onPosted, onCancel }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (title.trim().length < 3) {
      setErrors({ title: 'Write a short title (at least 3 characters)' });
      return;
    }
    setBusy(true);
    try {
      await askQuestion(lessonId, { title: title.trim(), body: body.trim() });
      toast.success('Your question was posted.');
      onPosted();
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      else toast.error(getErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4">
      <FormField
        label="Your question"
        name="title"
        value={title}
        maxLength={150}
        error={errors.title}
        placeholder="e.g. What is the difference between these two rulings?"
        onChange={(e) => {
          setTitle(e.target.value);
          setErrors({});
        }}
        autoFocus
      />
      <TextAreaField
        label="Details (optional)"
        name="body"
        rows={4}
        value={body}
        maxLength={3000}
        error={errors.body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy}>
          Post question
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---------- one open question with its replies ----------
function Thread({ questionId, me, onChanged, onDeleted }) {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(`/questions/${questionId}`);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [confirm, setConfirm] = useState(null); // { kind: 'question' | 'reply', id }

  if (loading && !data) return <Skeleton className="h-24 w-full" />;
  if (error || !data) return <Alert>{error || 'Could not load this question.'}</Alert>;

  const { question, replies, canModerate } = data;
  const mine = (author) => String(author?._id) === String(me._id);
  const canPickAnswer = mine(question.author) || canModerate;

  async function sendReply(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      await postReply(questionId, body.trim());
      setBody('');
      reload();
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPosting(false);
    }
  }

  async function toggleAnswer(reply) {
    setBusyId(reply._id);
    try {
      await setReplyAccepted(reply._id, !reply.accepted);
      reload();
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  async function confirmDelete() {
    const target = confirm;
    try {
      if (target.kind === 'question') {
        await removeQuestion(target.id);
        toast.info('Question deleted.');
        onDeleted();
      } else {
        await removeReply(target.id);
        toast.info('Reply deleted.');
        reload();
        onChanged();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirm(null);
    }
  }

  return (
    <div className="space-y-4 border-t border-brand-100 bg-brand-50/30 p-4">
      <div>
        {question.body ? (
          <p className="whitespace-pre-wrap break-words text-slate-800" dir="auto">
            {question.body}
          </p>
        ) : (
          <p className="text-sm text-slate-500">No further details.</p>
        )}
        {(mine(question.author) || canModerate) && (
          <button
            type="button"
            onClick={() => setConfirm({ kind: 'question', id: question._id })}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
          >
            <Icon name="trash" className="h-3.5 w-3.5" />
            Delete question
          </button>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
        </h4>
        {replies.length > 0 && (
          <ul className="space-y-3">
            {replies.map((r) => (
              <li
                key={r._id}
                className={`rounded-lg border bg-white p-3 ${r.accepted ? 'border-brand-400' : 'border-brand-100'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Byline author={r.author} date={r.createdAt} />
                  {r.accepted && (
                    <Badge tone="green">
                      <Icon name="tick" className="me-1 h-3 w-3" />
                      Answer
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-slate-800" dir="auto">
                  {r.body}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium">
                  {canPickAnswer && (
                    <button
                      type="button"
                      disabled={busyId === r._id}
                      onClick={() => toggleAnswer(r)}
                      className="text-brand-700 hover:underline disabled:opacity-60"
                    >
                      {r.accepted ? 'Unmark as answer' : 'Mark as answer'}
                    </button>
                  )}
                  {(mine(r.author) || canModerate) && (
                    <button
                      type="button"
                      onClick={() => setConfirm({ kind: 'reply', id: r._id })}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={sendReply} className="space-y-2">
        <TextAreaField
          label="Your reply"
          rows={3}
          value={body}
          maxLength={3000}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" size="sm" loading={posting} disabled={!body.trim()}>
          Post reply
        </Button>
      </form>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.kind === 'question' ? 'Delete this question?' : 'Delete this reply?'}
        message={
          confirm?.kind === 'question'
            ? 'The question and all its replies will be removed. This cannot be undone.'
            : 'This reply will be removed. This cannot be undone.'
        }
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

// Questions & answers under one lesson. Used in the student's lesson reader and on the teacher's
// lesson discussion page; the server decides who may take part (enrolled students, the course's
// teacher, admins) and who may delete what.
export default function Discussion({ lessonId }) {
  const { user } = useAuth();
  const [status, setStatus] = useState('all'); // 'all' | 'unanswered'
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [asking, setAsking] = useState(false);
  const { data, loading, error, reload } = useFetch(
    `/lessons/${lessonId}/questions?page=${page}&limit=${PAGE_SIZE}&status=${status}`
  );

  function changeStatus(next) {
    setStatus(next);
    setPage(1);
    setOpenId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter questions">
          <button type="button" className={chip(status === 'all')} aria-pressed={status === 'all'} onClick={() => changeStatus('all')}>
            All questions
          </button>
          <button
            type="button"
            className={chip(status === 'unanswered')}
            aria-pressed={status === 'unanswered'}
            onClick={() => changeStatus('unanswered')}
          >
            Unanswered
          </button>
        </div>
        {!asking && (
          <Button size="sm" onClick={() => setAsking(true)}>
            <Icon name="plus" className="h-4 w-4" />
            Ask a question
          </Button>
        )}
      </div>

      {asking && (
        <AskForm
          lessonId={lessonId}
          onCancel={() => setAsking(false)}
          onPosted={() => {
            setAsking(false);
            changeStatus('all');
            reload();
          }}
        />
      )}

      {error && <Alert>{error}</Alert>}
      {loading && !data && <Skeleton className="h-24 w-full" />}

      {data && data.questions.length === 0 && (
        <EmptyState
          title={status === 'unanswered' ? 'No unanswered questions' : 'No questions yet'}
          text={
            status === 'unanswered'
              ? 'Every question here has an answer.'
              : 'Not clear about something in this lesson? Ask here, and your teacher or classmates can help.'
          }
        />
      )}

      {data && data.questions.length > 0 && (
        <ul className="space-y-3">
          {data.questions.map((q) => {
            const open = openId === q._id;
            return (
              <li key={q._id} className="overflow-hidden rounded-xl border border-brand-100 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : q._id)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-3 p-4 text-start hover:bg-brand-50/50"
                >
                  <span className={`mt-0.5 shrink-0 ${q.answered ? 'text-brand-600' : 'text-slate-400'}`}>
                    <Icon name={q.answered ? 'check' : 'help'} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words font-semibold text-brand-800" dir="auto">
                      {q.title}
                    </span>
                    <Byline author={q.author} date={q.createdAt} />
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1 text-xs text-slate-500">
                    {q.answered && <Badge tone="green">Answered</Badge>}
                    <span className="inline-flex items-center gap-1">
                      <Icon name="message" className="h-3.5 w-3.5" />
                      {q.replyCount}
                      <span className="sr-only"> replies</span>
                    </span>
                  </span>
                </button>
                {open && (
                  <Thread
                    questionId={q._id}
                    me={user}
                    onChanged={reload}
                    onDeleted={() => {
                      setOpenId(null);
                      reload();
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {data && <Pagination page={page} pages={data.pages} onChange={setPage} />}
    </div>
  );
}
