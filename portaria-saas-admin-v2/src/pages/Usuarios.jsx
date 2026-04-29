import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => { apiFetch("/usuarios").then(setUsuarios).catch(() => {}); }, []);
  return <><div className="page-title"><h2>Usuários</h2><p>Operadores e administradores</p></div><div className="card"><div className="table-wrap"><table><thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th></tr></thead><tbody>{usuarios.map(u=><tr key={u.id}><td>{u.nome}</td><td>{u.email}</td><td>{u.perfil}</td><td><span className="badge">{u.ativo ? "Ativo" : "Inativo"}</span></td></tr>)}{!usuarios.length && <tr><td colSpan="4">Nenhum usuário.</td></tr>}</tbody></table></div></div></>;
}
