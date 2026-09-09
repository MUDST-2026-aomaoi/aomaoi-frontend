import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../controller/authController';

export default function AuthGuard({ children, allowedRoles }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  const location = useLocation();

  // If not logged in, redirect to login page
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not in the list, redirect to their home
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If passed all checks, render the protected component
  return children;
}
