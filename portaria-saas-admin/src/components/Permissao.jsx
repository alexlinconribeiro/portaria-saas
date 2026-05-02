import { usuarioTemPermissao } from "../utils/auth";

export default function Permissao({ perm, children, fallback = null }) {
  if (!usuarioTemPermissao(perm)) {
    return fallback;
  }

  return children;
}
