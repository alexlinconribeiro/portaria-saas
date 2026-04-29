import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [condominios, setCondominios] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [visitas, setVisitas] = useState([]);

  async function carregarDados() {
    const condominiosData = await apiFetch("/condominios");
    const pessoasData = await apiFetch("/pessoas?condominioId=1");
    const eventosData = await apiFetch("/eventos/acesso?condominioId=1");
    const visitasData = await apiFetch("/visitantes?condominioId=1");

    setCondominios(Array.isArray(condominiosData) ? condominiosData : []);
    setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
    setEventos(Array.isArray(eventosData) ? eventosData : []);
    setVisitas(Array.isArray(visitasData) ? visitasData : []);
  }

  useEffect(() => {
    carregarDados();

    const interval = setInterval(carregarDados, 10000);
    return () => clearInterval(interval);
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);

  const moradores = pessoas.filter((p) => p.tipo === "MORADOR");
  const acessosHoje = eventos.filter((e) => e.criadoEm?.slice(0, 10) === hoje);
  const visitasHoje = visitas.filter((v) => v.criadoEm?.slice(0, 10) === hoje);
  const visitasPendentes = visitas.filter((v) => v.status === "PENDENTE");
  const visitasDentro = visitas.filter((v) => v.status === "EM_ANDAMENTO");

  const cards = [
    { titulo: "Acessos hoje", valor: acessosHoje.length, subtitulo: "Entradas registradas" },
    { titulo: "Visitas hoje", valor: visitasHoje.length, subtitulo: "Solicitações criadas" },
    { titulo: "Pendentes", valor: visitasPendentes.length, subtitulo: "Aguardando autorização" },
    { titulo: "Dentro agora", valor: visitasDentro.length, subtitulo: "Visitantes no condomínio" },
  ];

  function formatarData(data) {
    return data ? new Date(data).toLocaleString("pt-BR") : "-";
  }

  function tipoLabel(tipo) {
    if (tipo === "VISITANTE_MANUAL") return "Visitante";
    if (tipo === "VISITANTE_IA") return "Visitante IA";
    if (tipo === "FACIAL") return "Facial";
    if (tipo === "TAG") return "Tag";
    if (tipo === "SENHA") return "Senha";
    return tipo || "-";
  }

  return (
    <Layout
      title="Dashboard"
      description="Visão operacional da portaria em tempo real."
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
          <h2>Visitantes dentro do condomínio</h2>

          {visitasDentro.length === 0 ? (
            <div className="empty">Nenhum visitante dentro no momento.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th>Unidade</th>
                  <th>Responsável</th>
                  <th>Entrada</th>
                </tr>
              </thead>

              <tbody>
                {visitasDentro.slice(0, 8).map((v) => (
                  <tr key={v.id}>
                    <td>{v.nomeVisitante || "-"}</td>
                    <td>{v.unidade?.identificacao || "-"}</td>
                    <td>{v.pessoaResponsavel?.nome || "-"}</td>
                    <td>{formatarData(v.entradaEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <h2>Visitantes pendentes</h2>

          {visitasPendentes.length === 0 ? (
            <div className="empty">Nenhuma visita pendente.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th>Unidade</th>
                  <th>Responsável</th>
                  <th>Motivo</th>
                </tr>
              </thead>

              <tbody>
                {visitasPendentes.slice(0, 8).map((v) => (
                  <tr key={v.id}>
                    <td>{v.nomeVisitante || "-"}</td>
                    <td>{v.unidade?.identificacao || "-"}</td>
                    <td>{v.pessoaResponsavel?.nome || "-"}</td>
                    <td>{v.motivo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="quick-actions" style={{ marginTop: 18 }}>
            <a className="quick-link" href="/visitantes">Abrir visitantes</a>
          </div>
        </div>
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
                  <th>Pessoa</th>
                  <th>Unidade</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {eventos.slice(0, 8).map((e) => (
                  <tr key={e.id}>
                    <td>{formatarData(e.criadoEm)}</td>
                    <td>{e.nome || "-"}</td>
                    <td>{e.unidade || "-"}</td>
                    <td>{tipoLabel(e.tipo)}</td>
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
  <h2>Resumo administrativo</h2>

  <div className="mini-summary">
    <a href="/pessoas" className="mini-card">
      <span>Pessoas</span>
      <strong>{pessoas.length}</strong>
    </a>

    <a href="/pessoas" className="mini-card">
      <span>Moradores</span>
      <strong>{moradores.length}</strong>
    </a>

    <a href="/condominios" className="mini-card">
      <span>Condomínios</span>
      <strong>{condominios.length}</strong>
    </a>
  </div>

  <div className="soft-links">
    <a href="/logs">Ver logs de acesso</a>
    <a href="/dispositivos">Ver dispositivos</a>
  </div>
</div>
      </section>
    </Layout>
  );
}