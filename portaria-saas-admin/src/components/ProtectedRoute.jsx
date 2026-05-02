import { Navigate } from "react-router-dom";
import { getUsuarioToken, usuarioTemPermissao, temModulo } from "../utils/auth";

export default function ProtectedRoute({ children, permissao, modulo }) {
  const usuario = getUsuarioToken();

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  if (modulo && !temModulo(modulo)) {
    return <Navigate to="/perfil" replace />;
  }

  if (permissao && !usuarioTemPermissao(permissao)) {
    return <Navigate to="/perfil" replace />;
  }

  return children;
}