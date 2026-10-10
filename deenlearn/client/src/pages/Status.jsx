import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/Alert.jsx';
import { Spinner } from '../components/Spinner.jsx';

export default function Status() {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    // validateStatus: a 503 (database down) still carries a useful JSON body
    api
      .get('/health', { validateStatus: (s) => s < 600 })
      .then((res) => setState({ data: res.data }))
      .catch((err) => setState({ error: getErrorMessage(err) }));
  }, []);

  if (state.loading) return <Spinner />;
  if (state.error) return <Alert>API unreachable: {state.error}</Alert>;

  const ok = state.data?.status === 'ok';
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader title="System status" action={<Badge tone={ok ? 'green' : 'red'}>{ok ? 'Online' : 'Degraded'}</Badge>} />
      <CardBody>
        <pre className="ltr-isolate overflow-x-auto text-sm">{JSON.stringify(state.data, null, 2)}</pre>
      </CardBody>
    </Card>
  );
}
