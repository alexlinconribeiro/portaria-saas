import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import { useAuth } from "../contexts/AuthContext";

export default function Dispositivos() {
  const { usuario } = useAuth();
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ nome: "", tipo: "FACIAL", ip: "", localizacao: "" });

  async function carregar() {
    const qs = usuario?.condominioId ? `?condominioId=${usuario.condominioId}` : "";
    setItens(await apiFetch(`/dispositivos${qs}`));
  }
  useEffect(() => { carregar().catch(() => {}); }, []);

  async function criar(e) {
    e.preventDefault();
    await apiFetch("/dispositivos", { method: "POST", body: JSON.stringify({ ...form, condominioId: usuario?.condominioId || 1 }) });
    setForm({ nome: "", tipo: "FACIAL", ip: "", localizacao: "" });
    carregar();
  }

  async function check(id) {
    await apiFetch(`/dispositivos/${id}/check`, { method: "POST", body: JSON.stringify({}) });
    carregar();
  }

  return <><div className="page-title"><h2>Dispositivos</h2><p>Leitores faciais, portões e integrações</p></div><div className="card mb"><h3>Novo dispositivo</h3><form className="inline-form" onSubmit={criar}><input placeholder="Nome" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/><input placeholder="Tipo" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}/><input placeholder="IP" value={form.ip} onChange={e=>setForm({...form,ip:e.target.value})}/><input placeholder="Localização" value={form.localizacao} onChange={e=>setForm({...form,localizacao:e.target.value})}/><button className="btn-primary">Salvar</button></form></div><div className="card"><h3>Dispositivos cadastrados</h3><div className="table-wrap"><table><thead><tr><th>Nome</th><th>Tipo</th><th>IP</th><th>Status</th><th></th></tr></thead><tbody>{itens.map(d=><tr key={d.id}><td>{d.nome}</td><td>{d.tipo}</td><td>{d.ip}</td><td><span className="badge">{d.status}</span></td><td><button onClick={()=>check(d.id)}>Check</button></td></tr>)}{!itens.length && <tr><td colSpan="5">Nenhum dispositivo.</td></tr>}</tbody></table></div></div></>;
}
