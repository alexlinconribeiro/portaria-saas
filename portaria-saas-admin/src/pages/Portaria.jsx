import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";
import { apiFetch } from "../services/api";
import { usuarioTemPermissao, getUsuarioToken } from "../utils/auth";

export default function Portaria() {
  const usuario = getUsuarioToken();
  const perfil = usuario?.perfil;

  const condominioIdUsuario = usuario?.condominioId
    ? String(usuario.condominioId)
    : "1";

  const [condominios, setCondominios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [visitas, setVisitas] = useState([]);

  const [condominioId, setCondominioId] = useState(condominioIdUsuario);
  const [busca, setBusca] = useState("");
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);

  async function carregar(id = condominioId) {
    let conds = [];

    if (perfil !== "PORTARIA") {
      const data = await apiFetch("/condominios");
      conds = Array.isArray(data) ? data : [];
    } else {
      conds = [
        {
          id: Number(condominioIdUsuario),
          nome: "Meu condomínio"
        }
      ];
    }

    const unidadesData = await apiFetch(`/unidades?condominioId=${id}`);
    const pessoasData = await apiFetch(`/pessoas?condominioId=${id}`);
    const visitasData = await apiFetch(`/visitantes?condominioId=${id}`);

    setCondominios(conds);
    setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
    setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
    setVisitas(Array.isArray(visitasData) ? visitasData : []);
  }

  useEffect(() => {
    carregar();
  }, []);

  function nomeUnidade(u) {
    return `${u.bloco ? `${u.bloco} - ` : ""}${u.identificacao}`;
  }

  const unidadesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    if (!termo) return unidades;

    return unidades.filter((u) =>
      nomeUnidade(u).toLowerCase().includes(termo)
    );
  }, [busca, unidades]);

  const moradores = useMemo(() => {
    if (!unidadeSelecionada) return [];

    return pessoas.filter(
      (p) =>
        p.tipo === "MORADOR" &&
        p.unidades?.some(
          (pu) => String(pu.unidadeId) === String(unidadeSelecionada.id)
        )
    );
  }, [pessoas, unidadeSelecionada]);

  const visitasDaUnidade = useMemo(() => {
    if (!unidadeSelecionada) return [];

    return visitas
      .filter((v) => String(v.unidadeId) === String(unidadeSelecionada.id))
      .slice(0, 5);
  }, [visitas, unidadeSelecionada]);

  const fila = visitas.filter((v) =>
    ["PENDENTE", "AUTORIZADO", "EM_ANDAMENTO"].includes(v.status)
  );

  async function acao(id, tipo) {
    await apiFetch(`/visitantes/${id}/${tipo}`, { method: "PATCH" });
    carregar(condominioId);
  }

  async function liberarAcesso(id) {
    await apiFetch("/portao/abrir", { method: "POST" });
    await apiFetch(`/visitantes/${id}/entrada`, { method: "PATCH" });
    carregar(condominioId);
  }

  return (
    <Layout title="Portaria" active="/portaria">
      <section className="grid">
        <div className="panel">
          <h2>Buscar unidade</h2>

          {perfil !== "PORTARIA" && (
            <Dropdown
              searchable
              placeholder="Condomínio"
              value={condominioId}
              onChange={(val) => {
                setCondominioId(val);
                setUnidadeSelecionada(null);
                carregar(val);
              }}
              options={condominios.map((c) => ({
                label: c.nome,
                value: String(c.id)
              }))}
            />
          )}

          <div className="portaria-search">
            <Search size={16} />
            <input
              placeholder="Buscar unidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="unit-list">
            {unidadesFiltradas.map((u) => (
              <button
                key={u.id}
                className={`unit-option ${
                  unidadeSelecionada?.id === u.id ? "active" : ""
                }`}
                onClick={() => setUnidadeSelecionada(u)}
              >
                {nomeUnidade(u)}
              </button>
            ))}
          </div>
        </div>

        <div className="panel portaria-side-panel">
		<h2>Atendimento da unidade</h2>

          {!unidadeSelecionada ? (
  <div className="empty">Selecione uma unidade para iniciar o atendimento.</div>
) : (
  <>
    <div className="portaria-unit-header">
      <span>Unidade selecionada</span>
      <strong>{nomeUnidade(unidadeSelecionada)}</strong>
      <span>{moradores.length} morador(es) vinculado(s)</span>
    </div>

    <h4 className="portaria-section-title">Moradores responsáveis</h4>

    {moradores.length === 0 ? (
      <div className="empty">Nenhum morador vinculado.</div>
    ) : (
      moradores.map((m) => (
        <div key={m.id} className="portaria-person-card">
          <strong>{m.nome}</strong>
          <span>{m.telefone || "Sem telefone cadastrado"}</span>
        </div>
      ))
    )}

    <h4 className="portaria-section-title">Visitantes recentes</h4>

    {visitasDaUnidade.length === 0 ? (
      <div className="empty">Nenhum visitante recente.</div>
    ) : (
      visitasDaUnidade.map((v) => (
        <div key={v.id} className="portaria-visit-card">
          <div className="visit-row">
            <div>
              <strong>{v.nomeVisitante}</strong>
              <span>Responsável: {v.pessoaResponsavel?.nome || "-"}</span>
            </div>

            <span className={`visit-status ${String(v.status || "").toLowerCase()}`}>
              {v.status || "-"}
            </span>
          </div>
        </div>
      ))
    )}
            </>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Fila operacional</h2>

        {fila.length === 0 ? (
          <div className="empty">Sem solicitações</div>
        ) : (
          fila.map((v) => (
            <div key={v.id} className="info-card">
              <strong>{v.nomeVisitante}</strong>

              {v.status === "PENDENTE" &&
                usuarioTemPermissao("visitantes.autorizar") && (
                  <>
                    <button onClick={() => acao(v.id, "autorizar")}>
                      Autorizar
                    </button>

                    <button onClick={() => acao(v.id, "negar")}>
                      Negar
                    </button>
                  </>
                )}

              {v.status === "AUTORIZADO" &&
                usuarioTemPermissao("portaria.operar") && (
                  <button onClick={() => liberarAcesso(v.id)}>
                    Liberar acesso
                  </button>
                )}

              {v.status === "EM_ANDAMENTO" &&
                usuarioTemPermissao("visitantes.finalizar") && (
                  <button onClick={() => acao(v.id, "saida")}>
                    Registrar saída
                  </button>
                )}
            </div>
          ))
        )}
      </section>
    </Layout>
  );
}