import { Navigate } from 'react-router-dom';
import { tokenStore } from '../api';

export default function ProtectedRoute({ children }) {
  if (!tokenStore.access) return <Navigate to="/login" replace />;
  return children;
}
