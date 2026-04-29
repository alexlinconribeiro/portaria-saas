import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  useEffect(() => { apiFetch("/perfil").then(setPerfil).catch(() => {}); }, []);
  return <><div className="page-title"><h2>Meu perfil</h2><p>Dados do usuário logado</p></div><div className="card"><pre>{JSON.stringify(perfil, null, 2)}</pre></div></>;
}
