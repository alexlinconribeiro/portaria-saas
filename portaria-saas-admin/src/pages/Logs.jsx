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
      }, 3000);
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

  function tipoLabel(tipo) {
    if (tipo === "FACIAL") return "Facial";
    if (tipo === "TAG") return "Tag";
    if (tipo === "SENHA") return "Senha";
    if (tipo === "VISITANTE_MANUAL") return "Visitante";
    if (tipo === "VISITANTE_IA") return "Visitante IA";
    return tipo;
  }

  function origemLabel(origem) {
    if (origem === "VISITANTES") return "Portaria";
    return origem || "-";
  }

  return (
    <Layout
      title="Logs de Acesso"
      description="Histórico de entradas de moradores e visitantes."
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
            placeholder="Tipo"
            value={filtro.tipo}
            onChange={(val) => setFiltro({ ...filtro, tipo: val })}
            options={[
              { label: "Todos", value: "" },
              { label: "Facial", value: "FACIAL" },
              { label: "Tag", value: "TAG" },
              { label: "Senha", value: "SENHA" },
              { label: "Visitante", value: "VISITANTE_MANUAL" }
            ]}
          />

          <Dropdown
            placeholder="Status"
            value={filtro.status}
            onChange={(val) => setFiltro({ ...filtro, status: val })}
            options={[
              { label: "Todos", value: "" },
              { label: "Autorizado", value: "AUTORIZADO" },
              { label: "Negado", value: "NEGADO" }
            ]}
          />

          <button onClick={carregar}>Filtrar</button>
        </div>
      </section>

      <section className="panel logs-panel">
        <h2>Registros de acesso</h2>

        {eventos.length === 0 ? (
          <div className="empty">Nenhum acesso registrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Pessoa</th>
                <th>Tipo</th>
                <th>Unidade</th>
                <th>Status</th>
                <th>Origem</th>
              </tr>
            </thead>

            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} className={novoEventoId === e.id ? "new-row" : ""}>
                  <td>{new Date(e.criadoEm).toLocaleString("pt-BR")}</td>

                  <td>
                    <strong>{e.nome || "Desconhecido"}</strong>
                  </td>

                  <td>
                    <span className="badge">
                      {tipoLabel(e.tipo)}
                    </span>
                  </td>

                  <td>{e.unidade || "-"}</td>

                  <td>
                    <span className={`badge ${e.status === "AUTORIZADO" ? "ok" : "bad"}`}>
                      {e.status}
                    </span>
                  </td>

                  <td>{origemLabel(e.origem)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  );
}