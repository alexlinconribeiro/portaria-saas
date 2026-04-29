import { Navigate } from "react-router-dom";
import { getToken, getPerfil, usuarioTemPermissao } from "../utils/auth";

export default function ProtectedRoute({
  children,
  allowed,       // array de perfis (compatibilidade)
  permissao      // nova forma: string de permissão
}) {
  const token = getToken();
  const perfil = getPerfil();

  // sem login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 🔐 NOVO: controle por permissão
  if (permissao && !usuarioTemPermissao(permissao)) {
    return redirecionar(perfil);
  }

  // 🔒 ANTIGO: controle por perfil
  if (allowed && !allowed.includes(perfil)) {
    return redirecionar(perfil);
  }

  return children;
}

/* =========================
   REDIRECIONAMENTO INTELIGENTE
========================= */

function redirecionar(perfil) {
  if (perfil === "PORTARIA") {
    return <Navigate to="/portaria" replace />;
  }

  if (perfil === "TECNICO") {
    return <Navigate to="/dispositivos" replace />;
  }

  if (perfil === "MORADOR") {
    return <Navigate to="/visitantes" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}