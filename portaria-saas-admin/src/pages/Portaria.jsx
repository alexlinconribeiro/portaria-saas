import Permissao from "../components/Permissao";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";
import { apiFetch } from "../services/api";
import { usuarioTemPermissao, getUsuarioToken } from "../utils/auth";

const leituraInicial = {
  tipo: "TAG",
  identificador: ""
};

export default function Portaria() {
  const usuario = getUsuarioToken();
  const perfil = usuario?.perfil;

  const podeVerPortaria = usuarioTemPermissao("portaria.ver");
  const podeOperarPortaria = usuarioTemPermissao("portaria.operar");
  const podeAbrirPortao = usuarioTemPermissao("portaria.abrir_portao");

  const podeVerVisitantes = usuarioTemPermissao("visitantes.ver");
  const podeAutorizarVisitantes = usuarioTemPermissao("visitantes.autorizar");
  const podeNegarVisitantes = usuarioTemPermissao("visitantes.negar");

  const isSuperAdmin = perfil === "SUPER_ADMIN";

  const condominioIdUsuario = usuario?.condominioId
    ? String(usuario.condominioId)
    : "1";

  const [aba, setAba] = useState("atendimento");

  const [condominios, setCondominios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [visitas, setVisitas] = useState([]);

  const [condominioId, setCondominioId] = useState(condominioIdUsuario);
  const [busca, setBusca] = useState("");
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(null);

  const [leitura, setLeitura] = useState(leituraInicial);
  const [resultado, setResultado] = useState(null);
  const [validando, setValidando] = useState(false);

  async function carregar(id = condominioId) {
    if (!podeVerPortaria || !podeVerVisitantes) return;

    try {
      if (isSuperAdmin) {
        const data = await apiFetch("/condominios");
        setCondominios(Array.isArray(data) ? data : []);
      } else {
        setCondominios([]);
      }

      const unidadesData = await apiFetch(`/unidades?condominioId=${id}`);
      const pessoasData = await apiFetch(`/pessoas?condominioId=${id}`);
      const visitasData = await apiFetch(`/visitantes?condominioId=${id}`);

      setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
      setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
      setVisitas(Array.isArray(visitasData) ? visitasData : []);
    } catch (erro) {
      console.error("Erro ao carregar dados da portaria:", erro);
      alert("Erro ao carregar dados da portaria.");
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (tipo === "autorizar" && !podeAutorizarVisitantes) {
      alert("Você não tem permissão para autorizar visitantes.");
      return;
    }

    if (tipo === "negar" && !podeNegarVisitantes) {
      alert("Você não tem permissão para negar visitantes.");
      return;
    }

    if (tipo === "saida" && !podeOperarPortaria) {
      alert("Você não tem permissão para operar a portaria.");
      return;
    }

    try {
      await apiFetch(`/visitantes/${id}/${tipo}`, { method: "PATCH" });
      carregar(condominioId);
    } catch (erro) {
      console.error("Erro ao executar ação:", erro);
      alert("Erro ao executar ação.");
    }
  }

  async function liberarAcesso(id) {
    if (!podeOperarPortaria || !podeAbrirPortao) {
      alert("Você não tem permissão para liberar acesso.");
      return;
    }

    try {
      await apiFetch("/portao/abrir", { method: "POST" });
      await apiFetch(`/visitantes/${id}/entrada`, { method: "PATCH" });
      carregar(condominioId);
    } catch (erro) {
      console.error("Erro ao liberar acesso:", erro);
      alert("Erro ao liberar acesso.");
    }
  }

  function atualizarLeitura(campo, valor) {
    setLeitura((atual) => ({ ...atual, [campo]: valor }));
  }

  async function validarAcesso() {
    if (!leitura.tipo || !leitura.identificador) {
      alert("Informe o tipo e o identificador.");
      return;
    }

    try {
      setValidando(true);
      setResultado(null);

      const data = await apiFetch("/acesso/validar", {
        method: "POST",
        body: JSON.stringify({
          tipo: leitura.tipo,
          identificador: leitura.identificador
        })
      });

      setResultado(data);
      carregar(condominioId);
    } catch (erro) {
      setResultado({
        autorizado: false,
        status: "NEGADO",
        mensagem: erro.message || "Acesso negado"
      });
    } finally {
      setValidando(false);
    }
  }

  function limparLeitura() {
    setLeitura(leituraInicial);
    setResultado(null);
  }

  if (!podeVerPortaria || !podeVerVisitantes) {
    return (
      <Layout title="Portaria" active="/portaria">
        <section className="panel">
          <div className="empty">
            Você não tem permissão para acessar a operação da portaria.
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="Portaria"
      description="Atendimento manual e validação de credenciais em tempo real."
      active="/portaria"
    >
      <div className="portaria-tabs">
        <button
          type="button"
          className={aba === "atendimento" ? "active" : ""}
          onClick={() => setAba("atendimento")}
        >
          Atendimento
        </button>

        <button
          type="button"
          className={aba === "credencial" ? "active" : ""}
          onClick={() => setAba("credencial")}
        >
          Leitura de credencial
        </button>
      </div>

      {aba === "atendimento" && (
        <>
          <section className="grid">
            <div className="panel">
              <h2>Buscar unidade</h2>

              {isSuperAdmin && (
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
                <div className="empty">
                  Selecione uma unidade para iniciar o atendimento.
                </div>
              ) : (
                <>
                  <div className="portaria-unit-header">
                    <span>Unidade selecionada</span>
                    <strong>{nomeUnidade(unidadeSelecionada)}</strong>
                    <span>{moradores.length} morador(es) vinculado(s)</span>
                  </div>

                  <h4 className="portaria-section-title">
                    Moradores responsáveis
                  </h4>

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

                  <h4 className="portaria-section-title">
                    Visitantes recentes
                  </h4>

                  {visitasDaUnidade.length === 0 ? (
                    <div className="empty">Nenhum visitante recente.</div>
                  ) : (
                    visitasDaUnidade.map((v) => (
                      <div key={v.id} className="portaria-visit-card">
                        <div className="visit-row">
                          <div>
                            <strong>{v.nomeVisitante}</strong>
                            <span>
                              Responsável: {v.pessoaResponsavel?.nome || "-"}
                            </span>
                          </div>

                          <span
                            className={`visit-status ${String(
                              v.status || ""
                            ).toLowerCase()}`}
                          >
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
                  <div className="info-card-header">
                    <div>
                      <small>Status: {v.status}</small>
                      <strong>{v.nomeVisitante}</strong>
                      <p>Unidade: {v.unidade?.identificacao || "-"}</p>
                      <p>Responsável: {v.pessoaResponsavel?.nome || "-"}</p>
                    </div>

                    <span
                      className={`status-pill ${String(
                        v.status || ""
                      ).toLowerCase()}`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <div className="info-action">
                    {v.status === "PENDENTE" && (
                      <>
                        {podeAutorizarVisitantes && (
                          <Permissao perm="visitantes.autorizar">
                            <button
                              className="table-btn"
                              onClick={() => acao(v.id, "autorizar")}
                            >
                              Autorizar
                            </button>
                          </Permissao>
                        )}

                        {podeNegarVisitantes && (
                          <Permissao perm="visitantes.negar">
                            <button
                              className="table-btn secondary-table-btn"
                              onClick={() => acao(v.id, "negar")}
                            >
                              Negar
                            </button>
                          </Permissao>
                        )}
                      </>
                    )}

                    {v.status === "AUTORIZADO" &&
                      podeOperarPortaria &&
                      podeAbrirPortao && (
                        <Permissao perm="portaria.abrir_portao">
                          <button
                            className="table-btn"
                            onClick={() => liberarAcesso(v.id)}
                          >
                            Liberar acesso
                          </button>
                        </Permissao>
                      )}

                    {v.status === "EM_ANDAMENTO" && podeOperarPortaria && (
                      <Permissao perm="portaria.operar">
                        <button
                          className="table-btn"
                          onClick={() => acao(v.id, "saida")}
                        >
                          Registrar saída
                        </button>
                      </Permissao>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}

      {aba === "credencial" && (
        <section className="panel portaria-live">
          <div className="portaria-live-header">
            <div>
              <h2>Validação de acesso</h2>
              <p className="muted-text">
                Simule leitura facial, tag RFID ou senha sem equipamento físico.
              </p>
            </div>

            <span className="badge ok">Modo simulado</span>
          </div>

          <div className="portaria-grid">
            <div className="portaria-reader-card">
              <div className="reader-icon">🔐</div>

              <div className="form-grid">
                <label className="field">
                  <span>Tipo de credencial</span>
                  <Dropdown
                    value={leitura.tipo}
                    onChange={(valor) => atualizarLeitura("tipo", valor)}
                    options={[
                      { label: "Tag RFID", value: "TAG" },
                      { label: "Facial", value: "FACIAL" },
                      { label: "Senha", value: "SENHA" }
                    ]}
                  />
                </label>

                <label className="field">
                  <span>Identificador</span>
                  <input
                    placeholder="Ex: código da tag, facial ou senha"
                    value={leitura.identificador}
                    onChange={(e) =>
                      atualizarLeitura("identificador", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") validarAcesso();
                    }}
                  />
                </label>
              </div>

              <div className="portaria-actions">
                <button
                  className="primary-btn"
                  onClick={validarAcesso}
                  disabled={validando}
                >
                  {validando ? "Validando..." : "Validar acesso"}
                </button>

                <button className="secondary-btn" onClick={limparLeitura}>
                  Limpar
                </button>
              </div>
            </div>

            <div
              className={`portaria-result-card ${
                resultado
                  ? resultado.autorizado
                    ? "authorized"
                    : "denied"
                  : ""
              }`}
            >
              {!resultado ? (
                <>
                  <div className="result-icon">⏳</div>
                  <h2>Aguardando leitura</h2>
                  <p>Informe uma credencial para validar o acesso.</p>
                </>
              ) : resultado.autorizado ? (
                <>
                  <div className="result-icon">✅</div>
                  <h2>Acesso liberado</h2>
                  <p>{resultado.mensagem}</p>

                  <div className="result-details">
                    <strong>{resultado.pessoa?.nome}</strong>
                    <span>{resultado.pessoa?.tipo}</span>

                    {resultado.unidade && (
                      <span>
                        Unidade: {resultado.unidade.bloco || "-"}{" "}
                        {resultado.unidade.identificacao}
                      </span>
                    )}

                    {resultado.eventoId && (
                      <small>Evento #{resultado.eventoId}</small>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="result-icon">🚫</div>
                  <h2>Acesso negado</h2>
                  <p>{resultado.mensagem}</p>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}