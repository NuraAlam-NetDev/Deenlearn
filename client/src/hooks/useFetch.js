import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';

// GET helper: const { data, loading, error } = useFetch('/courses?limit=6')
// Pass null to skip the request.
export function useFetch(url) {
  const [state, setState] = useState({ data: null, error: '', loading: !!url });

  useEffect(() => {
    if (!url) {
      setState({ data: null, error: '', loading: false });
      return undefined;
    }

    let cancelled = false;
    setState({ data: null, error: '', loading: true });

    api
      .get(url)
      .then((res) => {
        if (!cancelled) setState({ data: res.data, error: '', loading: false });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, error: getErrorMessage(err), loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}