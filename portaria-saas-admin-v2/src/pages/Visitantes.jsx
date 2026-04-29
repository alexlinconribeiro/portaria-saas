import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Visitantes() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    const data = await apiFetch("/visitantes");
    setVisitantes(data);
    setLoading(false);
  }

  async function autorizar(id) {
    await apiFetch(`/visitantes/${id}/autorizar`, { method: "PATCH" });
    carregar();
  }

  async function negar(id) {
    await apiFetch(`/visitantes/${id}/negar`, { method: "PATCH" });
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="content">
      {/* TÍTULO */}
      <div className="page-title">
        <h2>Visitantes</h2>
        <p>Gestão de visitantes do condomínio</p>
      </div>

      {/* BOTÃO */}
      <div className="mb">
        <button className="btn-primary">
          + Novo visitante
        </button>
      </div>

      {/* CARD */}
      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Unidade</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {visitantes.map((v) => (
                  <tr key={v.id}>
                    <td>{v.nomeVisitante}</td>

                    <td>
                      {v.unidade
                        ? `${v.unidade.bloco || ""} ${v.unidade.identificacao}`
                        : "-"}
                    </td>

                    <td>
                      <span className="badge">
                        {v.status}
                      </span>
                    </td>

                    <td>
                      {v.dataPrevista
                        ? new Date(v.dataPrevista).toLocaleString()
                        : "-"}
                    </td>

                    <td>
                      <div className="actions">
                        {v.status === "PENDENTE" && (
                          <>
                            <button
                              onClick={() => autorizar(v.id)}
                              className="btn-soft"
                            >
                              Autorizar
                            </button>

                            <button
                              onClick={() => negar(v.id)}
                              className="btn-danger-soft"
                            >
                              Negar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}