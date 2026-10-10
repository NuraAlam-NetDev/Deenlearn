import { useTranslation } from 'react-i18next';
import Icon from '../ui/Icon.jsx';
import { formatBytes } from '../../utils/format.js';
import { isHttpUrl, toEmbedUrl } from '../../utils/media.js';
import { toHtml } from '../../utils/richText.js';

// Teacher's YouTube / Vimeo link
function Video({ url }) {
  const { t } = useTranslation();
  const embed = toEmbedUrl(url);

  if (embed) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-brand-950">
        <iframe
          src={embed}
          title={t('reader.content.videoTitle')}
          className="h-full w-full"
          loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    );
  }

  if (!isHttpUrl(url)) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 font-medium text-brand-800 hover:bg-brand-100"
    >
      <Icon name="play" className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1">{t('reader.content.watchVideo')}</span>
      <Icon name="external" className="h-4 w-4 shrink-0" />
    </a>
  );
}

function Attachment({ file }) {
  if (!isHttpUrl(file.url)) return null;

  // Uploaded video: plays inside the lesson page
  if (file.kind === 'video') {
    return (
      <li className="rounded-lg border border-brand-100 p-3">
        <p className="mb-2 break-words text-sm font-medium text-slate-700" dir="auto">
          {file.name}
        </p>
        <video controls preload="metadata" src={file.url} className="w-full rounded-lg bg-black" />
      </li>
    );
  }

  if (file.kind === 'image') {
    return (
      <li>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg border border-brand-100"
        >
          <img src={file.url} alt={file.name} loading="lazy" className="mx-auto max-h-96 w-auto max-w-full" />
        </a>
        <p className="mt-1 break-words text-xs text-slate-500" dir="auto">
          {file.name}
        </p>
      </li>
    );
  }

  // PDF, MP3 and other files: click the link and it opens automatically in a new tab
  return (
    <li>
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg border border-brand-100 px-3 py-2.5 hover:bg-brand-50"
      >
        <Icon name="file" className="h-5 w-5 shrink-0 text-brand-700" />
        <span className="min-w-0 flex-1 break-words text-sm font-medium text-slate-800" dir="auto">
          {file.name}
        </span>
        {file.size > 0 && <span className="shrink-0 text-xs text-slate-500">{formatBytes(file.size)}</span>}
        <Icon name="external" className="h-4 w-4 shrink-0 text-slate-400" />
      </a>
    </li>
  );
}

// The body of a lesson: video, rich text, then downloads.
// lesson.content is HTML that the server sanitizes (when saved, and again when a lesson is read),
// so it is safe to render. Plain-text lessons from before the editor are converted by toHtml().
export default function LessonContent({ lesson }) {
  const { t } = useTranslation();
  const html = toHtml(lesson.content);
  const attachments = lesson.attachments ?? [];
  const sorted = [...attachments.filter((a) => a.kind !== 'image'), ...attachments.filter((a) => a.kind === 'image')];

  return (
    <div className="space-y-6">
      {lesson.videoUrl && <Video url={lesson.videoUrl} />}

      {html ? (
        <div className="rich-content" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        !lesson.videoUrl &&
        attachments.length === 0 && <p className="text-slate-500">{t('reader.content.noContent')}</p>
      )}

      {sorted.length > 0 && (
        <section aria-labelledby="lesson-files">
          <h2 id="lesson-files" className="mb-3 flex items-center gap-2 text-xl font-bold text-brand-800">
            <Icon name="paperclip" className="h-5 w-5" />
            {t('reader.content.files')}
          </h2>
          <ul className="space-y-2">
            {sorted.map((file) => (
              <Attachment key={file._id ?? file.url} file={file} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}