import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    apiFetch("/health").then(setHealth).catch(() => {});
    apiFetch("/eventos/acesso").then(setEventos).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-title">
        <h2>Dashboard</h2>
        <p>Resumo operacional do sistema</p>
      </div>

      <div className="grid cards-4">
        <div className="card metric"><span>Status API</span><strong>{health?.status || "-"}</strong></div>
        <div className="card metric"><span>Banco</span><strong>{health?.database || "-"}</strong></div>
        <div className="card metric"><span>Condomínios</span><strong>{health?.condominios ?? "-"}</strong></div>
        <div className="card metric"><span>Eventos recentes</span><strong>{eventos.length}</strong></div>
      </div>

      <div className="card mt">
        <h3>Últimos acessos</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nome</th><th>Unidade</th><th>Tipo</th><th>Status</th></tr></thead>
            <tbody>
              {eventos.slice(0, 8).map((e) => (
                <tr key={e.id}><td>{e.nome}</td><td>{e.unidade}</td><td>{e.tipo}</td><td><span className="badge">{e.status}</span></td></tr>
              ))}
              {!eventos.length && <tr><td colSpan="4">Nenhum evento carregado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
