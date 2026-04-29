import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import { useAuth } from "../contexts/AuthContext";

export default function Moradores() {
  const { usuario } = useAuth();
  const [moradores, setMoradores] = useState([]);
  useEffect(() => {
    const qs = usuario?.condominioId ? `?condominioId=${usuario.condominioId}` : "";
    apiFetch(`/moradores${qs}`).then(setMoradores).catch(() => {});
  }, []);
  return <><div className="page-title"><h2>Moradores</h2><p>Cadastro de moradores</p></div><div className="card"><div className="table-wrap"><table><thead><tr><th>Nome</th><th>Unidade</th><th>Email</th><th>Status</th></tr></thead><tbody>{moradores.map(m=><tr key={m.id}><td>{m.nome}</td><td>{m.unidade?.identificacao}</td><td>{m.email}</td><td><span className="badge">{m.ativo ? "Ativo" : "Inativo"}</span></td></tr>)}{!moradores.length && <tr><td colSpan="4">Nenhum morador.</td></tr>}</tbody></table></div></div></>;
}
