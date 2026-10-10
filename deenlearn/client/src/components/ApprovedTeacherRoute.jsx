import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Alert from './Alert.jsx';

// The teacher API answers 403 until an admin approves the account, so don't show the
// course pages (they would only show errors) until then.
export default function ApprovedTeacherRoute() {
  const { user } = useAuth();

  if (user.approvalStatus === 'pending') {
    return (
      <Alert type="warning">
        Your account is waiting for admin approval. You can manage courses as soon as it is approved.
      </Alert>
    );
  }
  if (user.approvalStatus === 'rejected') {
    return (
      <Alert type="error">
        Your teacher application was not approved{user.rejectionReason ? `: ${user.rejectionReason}` : '.'}
      </Alert>
    );
  }
  return <Outlet />;
}
