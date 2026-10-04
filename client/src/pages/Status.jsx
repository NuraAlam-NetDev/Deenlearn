import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';

export default function Status() {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    // validateStatus: a 503 (database down) still carries a useful JSON body
    api
      .get('/health', { validateStatus: (s) => s < 600 })
      .then((res) => setState({ data: res.data }))
      .catch((err) => setState({ error: getErrorMessage(err) }));
  }, []);

  if (state.loading) return <p>Checking API…</p>;
  if (state.error) return <p className="text-red-600">API unreachable: {state.error}</p>;

  return (
    <div className="rounded-lg bg-white p-5 shadow">
      <h2 className="mb-2 text-xl font-semibold">API status</h2>
      <pre className="overflow-x-auto text-sm">{JSON.stringify(state.data, null, 2)}</pre>
    </div>
  );
}