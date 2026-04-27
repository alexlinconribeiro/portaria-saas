import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Dropdown from "../components/Dropdown";
import Layout from "../components/Layout";

export default function Logs() {
  const [eventos, setEventos] = useState([]);
  const [novoEventoId, setNovoEventoId] = useState(null);

  const [filtro, setFiltro] = useState({
    tipo: "",
    status: "",
    unidade: ""
  });

  async function carregar() {
    const params = new URLSearchParams();

    params.set("condominioId", "1");

    if (filtro.tipo) params.set("tipo", filtro.tipo);
    if (filtro.status) params.set("status", filtro.status);
    if (filtro.unidade) params.set("unidade", filtro.unidade);

    const data = await apiFetch(`/eventos/acesso?${params.toString()}`);
    const lista = Array.isArray(data) ? data : [];

    if (eventos.length > 0 && lista.length > 0 && lista[0].id !== eventos[0].id) {
      setNovoEventoId(lista[0].id);

      setTimeout(() => {
        setNovoEventoId(null);
      }, 3500);
    }

    setEventos(lista);
  }

  useEffect(() => {
    carregar();

    const interval = setInterval(() => {
      carregar();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout
      title="Logs de Acesso"
      description="Monitore entradas por facial, tag, senha e visitantes."
      active="/logs"
    >
      <section className="panel">
        <h2>Filtros</h2>

        <div className="filters">
          <input
            placeholder="Unidade / apartamento"
            value={filtro.unidade}
            onChange={(e) => setFiltro({ ...filtro, unidade: e.target.value })}
          />

          <Dropdown
            placeholder="Todos os tipos"
            value={filtro.tipo}
            onChange={(val) => setFiltro({ ...filtro, tipo: val })}
            options={[
              { label: "Todos os tipos", value: "" },
              { label: "FACIAL", value: "FACIAL" },
              { label: "TAG", value: "TAG" },
              { label: "SENHA", value: "SENHA" },
              { label: "VISITANTE IA", value: "VISITANTE_IA" },
              { label: "VISITANTE MANUAL", value: "VISITANTE_MANUAL" }
            ]}
          />

          <Dropdown
            placeholder="Todos os status"
            value={filtro.status}
            onChange={(val) => setFiltro({ ...filtro, status: val })}
            options={[
              { label: "Todos os status", value: "" },
              { label: "AUTORIZADO", value: "AUTORIZADO" },
              { label: "NEGADO", value: "NEGADO" },
              { label: "PENDENTE", value: "PENDENTE" }
            ]}
          />

          <button onClick={carregar}>Filtrar</button>
        </div>
      </section>

      <section className="panel logs-panel">
        <h2>Registros</h2>

        {eventos.length === 0 ? (
          <div className="empty">Nenhum log encontrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome</th>
                <th>Unidade</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Origem</th>
              </tr>
            </thead>

            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} className={novoEventoId === e.id ? "new-row" : ""}>
                  <td>{new Date(e.criadoEm).toLocaleString("pt-BR")}</td>
                  <td>{e.nome || "-"}</td>
                  <td>{e.unidade || e.morador?.unidade?.identificacao || "-"}</td>
                  <td>{e.tipo}</td>
                  <td>
                    <span className={`badge ${e.status === "AUTORIZADO" ? "ok" : "bad"}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>{e.origem || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  );
}