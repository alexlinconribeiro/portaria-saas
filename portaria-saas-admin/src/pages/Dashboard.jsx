import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [condominios, setCondominios] = useState([]);
  const [moradores, setMoradores] = useState([]);
  const [eventos, setEventos] = useState([]);

  async function carregarDados() {
    const condominiosData = await apiFetch("/condominios");
    const moradoresData = await apiFetch("/moradores?condominioId=1");
    const eventosData = await apiFetch("/eventos/acesso?condominioId=1");

    setCondominios(Array.isArray(condominiosData) ? condominiosData : []);
    setMoradores(Array.isArray(moradoresData) ? moradoresData : []);
    setEventos(Array.isArray(eventosData) ? eventosData : []);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);

  const acessosHoje = eventos.filter((e) => {
    return e.criadoEm?.slice(0, 10) === hoje;
  });

  const cards = [
    { titulo: "Condomínios", valor: condominios.length, subtitulo: "Clientes cadastrados" },
    { titulo: "Moradores", valor: moradores.length, subtitulo: "No condomínio principal" },
    { titulo: "Acessos hoje", valor: acessosHoje.length, subtitulo: "Facial, tag e senha" },
    { titulo: "Eventos carregados", valor: eventos.length, subtitulo: "Últimos registros" },
  ];

  return (
    <Layout
      title="Dashboard"
      description="Visão geral da operação da portaria inteligente."
      active="/dashboard"
    >
      <section className="cards">
        {cards.map((card) => (
          <div className="card" key={card.titulo}>
            <span>{card.titulo}</span>
            <strong>{card.valor}</strong>
            <p>{card.subtitulo}</p>
          </div>
        ))}
      </section>

      <section className="grid">
        <div className="panel">
          <h2>Acessos recentes</h2>

          {eventos.length === 0 ? (
            <div className="empty">Nenhum acesso carregado ainda.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Unidade</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {eventos.slice(0, 8).map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.criadoEm).toLocaleString("pt-BR")}</td>
                    <td>{e.nome || "-"}</td>
                    <td>{e.unidade || "-"}</td>
                    <td>{e.tipo}</td>
                    <td>
                      <span className={`badge ${e.status === "AUTORIZADO" ? "ok" : "bad"}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <h2>Ações rápidas</h2>

          <div className="quick-actions">
            <a className="quick-link" href="/condominios">Gerenciar condomínios</a>
            <a className="quick-link" href="/usuarios">Gerenciar usuários</a>
            <a className="quick-link" href="/unidades">Unidades / Blocos</a>
            <a className="quick-link" href="/moradores">Moradores</a>
            <a className="quick-link" href="/credenciais">Faciais / Tags</a>
            <a className="quick-link" href="/visitantes">Visitantes</a>
            <a className="quick-link" href="/logs">Logs de acesso</a>
            <a className="quick-link" href="/dispositivos">Dispositivos</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}