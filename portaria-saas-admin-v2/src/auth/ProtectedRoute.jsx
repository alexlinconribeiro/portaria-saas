import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, allowed }) {
  const { token, usuario } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (allowed?.length && !allowed.includes(usuario?.perfil)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
