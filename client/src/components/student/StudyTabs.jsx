import { useState } from 'react';
import Alert from '../Alert.jsx';
import Discussion from '../Discussion.jsx';
import Badge from '../ui/Badge.jsx';
import { Card } from '../ui/Card.jsx';
import Icon from '../ui/Icon.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import NotesPanel from './NotesPanel.jsx';
import QuizPanel from './QuizPanel.jsx';

// Quiz / My notes / Q&A under a lesson. Controlled: the lesson page owns `active`
// (null = everything folded away), so it can also open a tab for the student.
// A tab's content is created the first time it is opened and then kept, so an unsaved note
// is not lost when the student peeks at another tab.
// quiz = the useFetch() result for GET /lessons/:id/quiz
export default function StudyTabs({ lessonId, quiz, active, onChange, onQuizAttempted }) {
  const info = quiz.data;
  const hasQuiz = !!info?.quiz;
  const quizPending = hasQuiz && info.quiz.required && !info.summary.passed;

  const tabs = [
    ...(hasQuiz ? [{ id: 'quiz', label: 'Quiz', icon: 'clipboard' }] : []),
    { id: 'notes', label: 'My notes', icon: 'edit' },
    { id: 'discussion', label: 'Q&A', icon: 'message' },
  ];
  const current = tabs.some((t) => t.id === active) ? active : null;

  const [visited, setVisited] = useState(() => new Set(current ? [current] : []));
  if (current && !visited.has(current)) setVisited(new Set(visited).add(current)); // "adjust state while rendering"

  function onKeyDown(e) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === document.activeElement?.dataset.tab);
    const next = tabs[(i + step + tabs.length) % tabs.length];
    onChange(next.id);
    document.getElementById(`study-tab-${next.id}`)?.focus();
  }

  return (
    <Card className="mt-6 overflow-hidden" aria-label="Study tools">
      <div role="tablist" aria-label="Study tools" onKeyDown={onKeyDown} className="flex overflow-x-auto border-b border-brand-100 bg-brand-50/40">
        {tabs.map((t) => {
          const selected = current === t.id;
          return (
            <button
              key={t.id}
              id={`study-tab-${t.id}`}
              data-tab={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`study-panel-${t.id}`}
              tabIndex={selected || (!current && t.id === tabs[0].id) ? 0 : -1}
              onClick={() => onChange(selected ? null : t.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                selected
                  ? 'border-brand-700 bg-white text-brand-800'
                  : 'border-transparent text-slate-600 hover:bg-brand-50 hover:text-brand-800'
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              {t.label}
              {t.id === 'quiz' && quizPending && <Badge tone="gold">Required</Badge>}
            </button>
          );
        })}
      </div>

      {!current && (
        <p className="px-5 py-4 text-sm text-slate-500">
          {hasQuiz ? 'Take the quiz, ' : ''}write a private note, or ask a question about this lesson.
        </p>
      )}

      {tabs.map((t) =>
        visited.has(t.id) ? (
          <div
            key={t.id}
            id={`study-panel-${t.id}`}
            role="tabpanel"
            aria-labelledby={`study-tab-${t.id}`}
            hidden={current !== t.id}
            className="p-4 sm:p-5"
          >
            {t.id === 'quiz' && (quiz.loading && !info ? <Skeleton className="h-32 w-full" /> : info?.quiz ? (
              <QuizPanel lessonId={lessonId} info={info} onAttempted={onQuizAttempted} />
            ) : (
              <Alert>{quiz.error || 'This quiz is not available.'}</Alert>
            ))}
            {t.id === 'notes' && <NotesPanel lessonId={lessonId} />}
            {t.id === 'discussion' && <Discussion lessonId={lessonId} />}
          </div>
        ) : null
      )}
    </Card>
  );
}
