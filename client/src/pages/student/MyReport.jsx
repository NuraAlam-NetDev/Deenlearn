import { useTranslation } from 'react-i18next';
import { useFetch } from '../../hooks/useFetch.js';
import Alert from '../../components/Alert.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import StudentReport from '../../components/report/StudentReport.jsx';

// /student/report : the student's own learning record
export default function MyReport() {
  const { t } = useTranslation();
  const { data, loading, error, reload } = useFetch('/enrollments/report');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-brand-800">{t('report.title')}</h1>
        <p className="mt-1 text-slate-600">{t('report.subtitle')}</p>
      </div>

      {loading && !data && <Spinner />}
      {error && (
        <Alert>
          {error}{' '}
          <button type="button" onClick={reload} className="font-semibold underline">
            {t('report.retry')}
          </button>
        </Alert>
      )}
      {data && <StudentReport data={data} />}
    </div>
  );
}
