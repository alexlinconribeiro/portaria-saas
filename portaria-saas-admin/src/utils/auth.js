function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

export function getUsuarioToken() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  return decodeJwt(token);
}

export function getPerfil() {
  const usuario = getUsuarioToken();
  return usuario?.perfil || null;
}

export function usuarioTemPermissao(permissao) {
  const usuario = getUsuarioToken();

  if (!usuario) return false;

  if (usuario.perfil === "SUPER_ADMIN") return true;

  const permissoes = usuario.permissoes || [];

  return permissoes.includes(permissao);
}

export function temModulo(modulo) {
  const usuario = getUsuarioToken();

  if (!usuario) return false;

  if (usuario.perfil === "SUPER_ADMIN") return true;

  const modulos = usuario.modulos || [];

  return modulos.includes(modulo);
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}