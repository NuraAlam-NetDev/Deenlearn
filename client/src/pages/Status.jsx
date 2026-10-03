import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Status() {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    api('/health')
      .then((data) => setState({ data }))
      .catch((error) => setState({ error: error.message }));
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
