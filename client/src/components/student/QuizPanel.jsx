import { useState } from 'react';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import { submitQuizAttempt } from '../../services/studentService.js';
import { formatDateTime } from '../../utils/format.js';
import Alert from '../Alert.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';

// What happened to one option after grading: shown with text AND an icon, never colour alone
function optionState(option, review) {
  const isCorrect = review.correctOptionIds.includes(option._id);
  const picked = review.selected.includes(option._id);
  if (isCorrect && picked) return { label: 'Your answer · correct', tone: 'good' };
  if (isCorrect) return { label: 'Correct answer', tone: 'good' };
  if (picked) return { label: 'Your answer · wrong', tone: 'bad' };
  return null;
}

const TONE = {
  good: 'border-brand-400 bg-brand-50',
  bad: 'border-red-300 bg-red-50',
  none: 'border-brand-100 bg-white',
};

function ReviewQuestion({ index, question, review }) {
  return (
    <li className="rounded-xl border border-brand-100 bg-white p-4">
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 shrink-0 ${review.correct ? 'text-brand-600' : 'text-red-600'}`}>
          <Icon name={review.correct ? 'check' : 'error'} className="h-5 w-5" />
        </span>
        <h3 className="min-w-0 break-words font-semibold text-slate-800" dir="auto">
          {index + 1}. {review.text}
          <span className="sr-only">{review.correct ? ' (answered correctly)' : ' (answered incorrectly)'}</span>
        </h3>
      </div>

      {question && (
        <ul className="mt-3 space-y-2">
          {question.options.map((o) => {
            const state = optionState(o, review);
            return (
              <li key={o._id} className={`rounded-lg border px-3 py-2 text-sm ${TONE[state?.tone ?? 'none']}`}>
                <span dir="auto" className="break-words">
                  {o.text}
                </span>
                {state && (
                  <span
                    className={`mt-0.5 flex items-center gap-1 text-xs font-semibold ${
                      state.tone === 'good' ? 'text-brand-700' : 'text-red-700'
                    }`}
                  >
                    <Icon name={state.tone === 'good' ? 'tick' : 'x'} className="h-3.5 w-3.5" />
                    {state.label}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {review.explanation && (
        <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-900" dir="auto">
          <span className="font-semibold">Why: </span>
          {review.explanation}
        </p>
      )}
    </li>
  );
}

function Result({ result, quiz, onRetake, onBack }) {
  const { attempt, review } = result;
  const byId = new Map(quiz.questions.map((q) => [q._id, q]));

  return (
    <div className="space-y-5">
      <div
        className={`rounded-xl border p-5 text-center ${
          attempt.passed ? 'border-brand-300 bg-brand-50' : 'border-gold-300 bg-gold-50'
        }`}
        role="status"
      >
        <p className="font-display text-5xl font-bold text-brand-800">{attempt.score}%</p>
        <p className="mt-1 font-semibold text-slate-800">
          {attempt.passed ? "Passed. Masha'Allah!" : 'Not passed yet'}
        </p>
        <p className="text-sm text-slate-600">
          {attempt.correctCount} of {attempt.totalQuestions} correct · you need {attempt.passingScore}% to pass
        </p>
        {!attempt.passed && <p className="mt-2 text-sm text-slate-600">Read the answers below, then try again.</p>}
      </div>

      <ol className="space-y-3" aria-label="Answers">
        {review.map((r, i) => (
          <ReviewQuestion key={r.question} index={i} question={byId.get(r.question)} review={r} />
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onRetake} variant={attempt.passed ? 'outline' : 'primary'}>
          Try again
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back to quiz summary
        </Button>
      </div>
    </div>
  );
}

function Taking({ quiz, lessonId, onCancel, onGraded }) {
  const toast = useToast();
  const [answers, setAnswers] = useState({}); // questionId -> [optionId]
  const [submitting, setSubmitting] = useState(false);

  const unanswered = quiz.questions.filter((q) => !answers[q._id]?.length).length;

  function choose(question, optionId, checked) {
    setAnswers((prev) => {
      if (!question.multiple) return { ...prev, [question._id]: [optionId] };
      const current = prev[question._id] ?? [];
      const next = checked ? [...current, optionId] : current.filter((id) => id !== optionId);
      return { ...prev, [question._id]: next };
    });
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = quiz.questions.map((q) => ({ question: q._id, selected: answers[q._id] ?? [] }));
      const result = await submitQuizAttempt(lessonId, body);
      onGraded(result);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {quiz.questions.map((q, i) => (
        <fieldset key={q._id} className="rounded-xl border border-brand-100 bg-white p-4">
          <legend className="px-1 font-semibold text-slate-800" dir="auto">
            {i + 1}. {q.text}
          </legend>
          <p className="mb-2 px-1 text-xs text-slate-500">
            {q.multiple ? 'Select all that apply' : 'Select one answer'}
          </p>
          <div className="space-y-2">
            {q.options.map((o) => {
              const checked = !!answers[q._id]?.includes(o._id);
              return (
                <label
                  key={o._id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    checked ? 'border-brand-500 bg-brand-50' : 'border-brand-100 hover:bg-brand-50/60'
                  }`}
                >
                  <input
                    type={q.multiple ? 'checkbox' : 'radio'}
                    name={`q-${q._id}`}
                    checked={checked}
                    onChange={(e) => choose(q, o._id, e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand-700"
                  />
                  <span className="min-w-0 break-words text-sm text-slate-800" dir="auto">
                    {o.text}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={submitting}>
          Submit answers
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        {unanswered > 0 && (
          <p className="text-sm text-gold-800" aria-live="polite">
            {unanswered} question{unanswered === 1 ? '' : 's'} not answered yet. Unanswered questions count as wrong.
          </p>
        )}
      </div>
    </form>
  );
}

// info = response of GET /lessons/:id/quiz ({ quiz, attempts, summary })
// onAttempted() is called after every graded attempt, so the parent can refresh (e.g. unlock "Mark as complete")
export default function QuizPanel({ lessonId, info, onAttempted }) {
  const [mode, setMode] = useState('intro'); // 'intro' | 'taking' | 'result'
  const [result, setResult] = useState(null);
  const [taken, setTaken] = useState(null); // the quiz exactly as it was when the student started

  const { quiz, attempts, summary } = info;
  const count = quiz.questions.length;

  // always starts from the latest version of the quiz (the teacher may have edited it)
  function start() {
    setTaken(quiz);
    setMode('taking');
  }

  if (mode === 'taking') {
    return (
      <Taking
        quiz={taken}
        lessonId={lessonId}
        onCancel={() => setMode('intro')}
        onGraded={(res) => {
          setResult(res);
          setMode('result');
          onAttempted();
        }}
      />
    );
  }

  if (mode === 'result' && result) {
    return (
      <Result
        result={result}
        quiz={taken}
        onRetake={start}
        onBack={() => setMode('intro')}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words font-display text-xl font-bold text-brand-800" dir="auto">
            {quiz.title}
          </h3>
          {quiz.required && <Badge tone="gold">Required</Badge>}
          {summary.passed && <Badge tone="green">Passed</Badge>}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {count} question{count === 1 ? '' : 's'} · pass mark {quiz.passingScore}% · retake as many times as you like
        </p>
      </div>

      {quiz.required && !summary.passed && (
        <Alert type="info">You need to pass this quiz before you can mark the lesson as complete.</Alert>
      )}

      {summary.attempts > 0 && (
        <div className="rounded-xl border border-brand-100 bg-white p-4">
          <p className="text-sm text-slate-700">
            Best score: <span className="font-bold text-brand-800">{summary.bestScore}%</span> · {summary.attempts}{' '}
            attempt{summary.attempts === 1 ? '' : 's'}
          </p>
          <ul className="mt-3 divide-y divide-brand-50 text-sm" aria-label="Your recent attempts">
            {attempts.map((a) => (
              <li key={a._id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="text-slate-600">{formatDateTime(a.createdAt)}</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{a.score}%</span>
                  <Badge tone={a.passed ? 'green' : 'gray'}>{a.passed ? 'Passed' : 'Not passed'}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={start}>{summary.attempts > 0 ? 'Retake quiz' : 'Start quiz'}</Button>
    </div>
  );
}
