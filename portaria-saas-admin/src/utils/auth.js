import { temPermissao } from "./permissoes";

export function getToken() {
  return localStorage.getItem("token");
}

export function getUsuarioToken() {
  try {
    const token = getToken();
    if (!token) return null;

    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function getPerfil() {
  const usuario = getUsuarioToken();

  return (
    usuario?.perfil ||
    usuario?.tipo ||
    usuario?.role ||
    usuario?.nivel ||
    usuario?.permissao ||
    null
  );
}

export function usuarioTemPermissao(permissao) {
  const perfil = getPerfil();
  return temPermissao(perfil, permissao);
}

export function isAdmin() {
  const perfil = getPerfil();
  return perfil === "SUPER_ADMIN" || perfil === "ADMIN_CONDOMINIO";
}

export function isPortaria() {
  return getPerfil() === "PORTARIA";
}

export function isTecnico() {
  return getPerfil() === "TECNICO";
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}