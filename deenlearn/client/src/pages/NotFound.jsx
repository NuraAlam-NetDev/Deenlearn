import { ButtonLink } from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      text="The page you are looking for does not exist or has moved."
      action={<ButtonLink to="/">Back home</ButtonLink>}
    />
  );
}
