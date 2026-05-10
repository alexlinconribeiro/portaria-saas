import { useEffect, useMemo, useRef, useState } from "react";
import {
  DoorOpen,
  Package,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Bell,
  KeyRound,
  Car,
  UserCheck,
  Activity,
  Maximize,
  Minimize
} from "lucide-react";

import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";
import { apiFetch } from "../services/api";
import { getUsuarioToken, usuarioTemPermissao } from "../utils/auth";

const formEncomendaInicial = {
  unidadeId: "",
  descricao: "",
  codigo: "",
  remetente: "",
  observacao: ""
};

export default function PortariaOperacional() {
  const usuario = getUsuarioToken();
  const isSuperAdmin = usuario?.perfil === "SUPER_ADMIN";

  const params = new URLSearchParams(window.location.search);
  const modoKiosk = params.get("kiosk") === "1";

  const codigoInputRef = useRef(null);

  const [fullscreen, setFullscreen] = useState(false);

  const [condominios, setCondominios] = useState([]);
  const [condominioId, setCondominioId] = useState(
    usuario?.condominioId
      ? String(usuario.condominioId)
      : "1"
  );

  const [unidades, setUnidades] = useState([]);
  const [visitantes, setVisitantes] = useState([]);
  const [encomendas, setEncomendas] = useState([]);
  const [eventos, setEventos] = useState([]);

  const [busca, setBusca] = useState("");
  const [codigoRetirada, setCodigoRetirada] =
    useState("");

  const [encomendaValidada, setEncomendaValidada] =
    useState(null);

  const [formEncomenda, setFormEncomenda] =
    useState(formEncomendaInicial);

  const [carregando, setCarregando] =
    useState(false);

  const [salvandoEncomenda, setSalvandoEncomenda] =
    useState(false);

  const [modalMensagem, setModalMensagem] =
    useState(null);

  const [toast, setToast] = useState(null);

  const [modalConfirmacao, setModalConfirmacao] =
    useState(null);

  const podePortaria =
    usuarioTemPermissao("portaria.operar") ||
    usuarioTemPermissao("portaria.ver");

  const podeAbrirPortao =
    usuarioTemPermissao("portaria.abrir_portao") ||
    usuarioTemPermissao("portaria.operar");

  const podeVisitantes =
    usuarioTemPermissao("visitantes.ver");

  const podeEncomendas =
    usuarioTemPermissao("encomendas.ver");

  const podeRegistrarEncomenda =
    usuarioTemPermissao(
      "encomendas.registrar"
    );

  const podeNotificarEncomenda =
    usuarioTemPermissao(
      "encomendas.notificar_morador"
    ) ||
    usuarioTemPermissao(
      "encomendas.editar"
    );

  const toastIcon = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    warning: <Bell size={18} />,
    info: <Activity size={18} />
  };

  function mostrarToast(
    texto,
    tipo = "info"
  ) {
    setToast({ texto, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  function nomeUnidade(unidade) {
    if (!unidade) return "-";

    return `${
      unidade.bloco
        ? `${unidade.bloco} - `
        : ""
    }${unidade.identificacao}`;
  }

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleString(
      "pt-BR"
    );
  }

  function statusClasse(status) {
    return String(
      status || ""
    ).toLowerCase();
  }

  function tocarFeedback() {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
      );

      audio.volume = 0.2;

      audio.play().catch(() => {});
    } catch {}
  }

  async function alternarFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();

        setFullscreen(true);

        mostrarToast(
          "Modo fullscreen ativado",
          "success"
        );
      } else {
        await document.exitFullscreen();

        setFullscreen(false);

        mostrarToast(
          "Modo fullscreen desativado",
          "info"
        );
      }
    } catch {
      mostrarToast(
        "Seu navegador bloqueou o fullscreen.",
        "error"
      );
    }
  }

  useEffect(() => {
    function fullscreenListener() {
      setFullscreen(
        !!document.fullscreenElement
      );
    }

    document.addEventListener(
      "fullscreenchange",
      fullscreenListener
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        fullscreenListener
      );
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      codigoInputRef.current?.focus();
    }, 300);
  }, []);

  useEffect(() => {
    if (modoKiosk) {
      setTimeout(() => {
        alternarFullscreen();
      }, 700);
    }

    // eslint-disable-next-line
  }, []);

  async function carregar(
    id = condominioId
  ) {
    try {
      setCarregando(true);

      if (isSuperAdmin) {
        const dadosCondominios =
          await apiFetch("/condominios");

        setCondominios(
          Array.isArray(dadosCondominios)
            ? dadosCondominios
            : []
        );
      }

      const params = new URLSearchParams();

      if (id)
        params.append(
          "condominioId",
          id
        );

      const query = params.toString()
        ? `?${params.toString()}`
        : "";

      const [
        dadosUnidades,
        dadosVisitantes,
        dadosEncomendas,
        dadosEventos
      ] = await Promise.allSettled([
        apiFetch(`/unidades${query}`),

        podeVisitantes
          ? apiFetch(`/visitantes${query}`)
          : Promise.resolve([]),

        podeEncomendas
          ? apiFetch(`/encomendas${query}`)
          : Promise.resolve([]),

        apiFetch(`/eventos/acesso${query}`)
      ]);

      setUnidades(
        dadosUnidades.status ===
          "fulfilled" &&
          Array.isArray(
            dadosUnidades.value
          )
          ? dadosUnidades.value
          : []
      );

      setVisitantes(
        dadosVisitantes.status ===
          "fulfilled" &&
          Array.isArray(
            dadosVisitantes.value
          )
          ? dadosVisitantes.value
          : []
      );

      setEncomendas(
        dadosEncomendas.status ===
          "fulfilled" &&
          Array.isArray(
            dadosEncomendas.value
          )
          ? dadosEncomendas.value
          : []
      );

      setEventos(
        dadosEventos.status ===
          "fulfilled" &&
          Array.isArray(
            dadosEventos.value
          )
          ? dadosEventos.value
          : []
      );
    } catch (erro) {
      mostrarToast(
        erro.message ||
          "Erro ao carregar central.",
        "error"
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();

    const timer = setInterval(() => {
      carregar(condominioId);
    }, 15000);

    return () => clearInterval(timer);

    // eslint-disable-next-line
  }, []);

  const unidadesOptions = unidades.map(
    (u) => ({
      value: String(u.id),
      label: nomeUnidade(u)
    })
  );

  const visitantesPendentes =
    useMemo(() => {
      return visitantes
        .filter((v) =>
          [
            "PENDENTE",
            "AUTORIZADO",
            "EM_ANDAMENTO"
          ].includes(v.status)
        )
        .slice(0, 6);
    }, [visitantes]);

  const encomendasPendentes =
    useMemo(() => {
      return encomendas
        .filter((e) =>
          [
            "PENDENTE",
            "NOTIFICADO"
          ].includes(e.status)
        )
        .slice(0, 6);
    }, [encomendas]);

  function abrirPortao(
    tipo = "SOCIAL"
  ) {
    if (!podeAbrirPortao) {
      mostrarToast(
        "Sem permissão.",
        "error"
      );

      return;
    }

    setModalConfirmacao({
      titulo: "Confirmar abertura",

      mensagem: `Deseja liberar ${tipo}?`,

      acao: async () => {
        try {
          await apiFetch(
            "/portao/abrir",
            {
              method: "POST",

              body: JSON.stringify({
                tipo,
                condominioId:
                  Number(condominioId)
              })
            }
          );

          tocarFeedback();

          await carregar(condominioId);

          mostrarToast(
            `${tipo} liberado.`,
            "success"
          );
        } catch (erro) {
          mostrarToast(
            erro.message ||
              "Erro ao abrir portão.",
            "error"
          );
        }
      }
    });
  }

  async function registrarEncomenda(e) {
    e.preventDefault();

    try {
      setSalvandoEncomenda(true);

      await apiFetch("/encomendas", {
        method: "POST",

        body: JSON.stringify({
          condominioId:
            Number(condominioId),

          unidadeId:
            formEncomenda.unidadeId
              ? Number(
                  formEncomenda.unidadeId
                )
              : null,

          descricao:
            formEncomenda.descricao ||
            null,

          codigo:
            formEncomenda.codigo ||
            null,

          remetente:
            formEncomenda.remetente ||
            null,

          observacao:
            formEncomenda.observacao ||
            null
        })
      });

      setFormEncomenda(
        formEncomendaInicial
      );

      tocarFeedback();

      await carregar(condominioId);

      mostrarToast(
        "Encomenda registrada.",
        "success"
      );
    } catch (erro) {
      mostrarToast(
        erro.message ||
          "Erro ao registrar encomenda.",
        "error"
      );
    } finally {
      setSalvandoEncomenda(false);
    }
  }

  async function validarCodigoRetirada(
    e
  ) {
    e.preventDefault();

    if (!codigoRetirada.trim()) {
      mostrarToast(
        "Digite o código.",
        "warning"
      );

      codigoInputRef.current?.focus();

      return;
    }

    try {
      const params =
        new URLSearchParams();

      if (condominioId) {
        params.append(
          "condominioId",
          condominioId
        );
      }

      const resposta =
        await apiFetch(
          `/encomendas/retirada/${codigoRetirada.trim()}?${params.toString()}`
        );

      setEncomendaValidada(
        resposta.encomenda
      );

      tocarFeedback();

      mostrarToast(
        "Código válido.",
        "success"
      );
    } catch (erro) {
      setEncomendaValidada(null);

      mostrarToast(
        erro.message ||
          "Código inválido.",
        "error"
      );

      setTimeout(() => {
        codigoInputRef.current?.focus();
      }, 150);
    }
  }

  function confirmarRetirada() {
    if (
      !encomendaValidada?.codigoRetirada
    )
      return;

    setModalConfirmacao({
      titulo: "Confirmar retirada",

      mensagem: `Confirmar retirada da unidade ${nomeUnidade(
        encomendaValidada.unidade
      )}?`,

      acao: async () => {
        try {
          const params =
            new URLSearchParams();

          if (condominioId) {
            params.append(
              "condominioId",
              condominioId
            );
          }

          await apiFetch(
            `/encomendas/retirada/${encomendaValidada.codigoRetirada}/confirmar?${params.toString()}`,
            {
              method: "PATCH"
            }
          );

          setCodigoRetirada("");

          setEncomendaValidada(null);

          tocarFeedback();

          await carregar(condominioId);

          mostrarToast(
            "Retirada confirmada.",
            "success"
          );

          setTimeout(() => {
            codigoInputRef.current?.focus();
          }, 150);
        } catch (erro) {
          mostrarToast(
            erro.message ||
              "Erro ao confirmar retirada.",
            "error"
          );
        }
      }
    });
  }

  if (!podePortaria) {
    return (
      <Layout
        title="Central Operacional"
        active="/portaria-operacional"
      >
        <section className="panel">
          <div className="empty">
            Você não tem permissão.
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="Central Operacional"
      description="Tela única da portaria."
      active="/portaria-operacional"
      hideSidebar={
        fullscreen || modoKiosk
      }
      hideHeader={
        fullscreen || modoKiosk
      }
      className={
        fullscreen || modoKiosk
          ? "layout-operacional-full"
          : ""
      }
    >
      {toast && (
        <div
          className={`operacional-toast ${toast.tipo}`}
        >
          {toastIcon[toast.tipo]}

          <span>{toast.texto}</span>
        </div>
      )}

      {modalConfirmacao && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal-card">
            <h2>
              {modalConfirmacao.titulo}
            </h2>

            <p>
              {
                modalConfirmacao.mensagem
              }
            </p>

            <div className="form-actions">
              <button
                className="primary-btn"
                type="button"
                onClick={async () => {
                  const acao =
                    modalConfirmacao.acao;

                  setModalConfirmacao(
                    null
                  );

                  if (acao) {
                    await acao();
                  }
                }}
              >
                Confirmar
              </button>

              <button
                className="secondary-btn"
                type="button"
                onClick={() =>
                  setModalConfirmacao(
                    null
                  )
                }
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="operacional-header panel">
        <div className="operacional-search">
          <Search size={18} />

          <input
            placeholder="Buscar unidade, visitante, encomenda..."
            value={busca}
            onChange={(e) =>
              setBusca(
                e.target.value
              )
            }
          />
        </div>

        {isSuperAdmin && (
          <Dropdown
            searchable
            placeholder="Condomínio"
            value={condominioId}
            onChange={(valor) => {
              setCondominioId(
                valor
              );

              carregar(valor);
            }}
            options={condominios.map(
              (c) => ({
                value: String(c.id),
                label: c.nome
              })
            )}
          />
        )}

        <div className="operacional-top-actions">
          <button
            className="secondary-btn"
            type="button"
            onClick={() =>
              carregar(condominioId)
            }
          >
            <RefreshCw size={16} />

            {carregando
              ? "Atualizando..."
              : "Atualizar"}
          </button>

          <button
            className="primary-btn"
            type="button"
            onClick={
              alternarFullscreen
            }
          >
            {fullscreen ? (
              <Minimize size={18} />
            ) : (
              <Maximize size={18} />
            )}

            {fullscreen
              ? "Sair Tela Cheia"
              : "Tela Cheia"}
          </button>
        </div>
      </section>

      <section className="operacional-grid">
        <div className="panel operacional-card">
          <h2>
            <DoorOpen size={20} />
            Ações rápidas
          </h2>

          <div className="operacional-actions-grid">
            <button
              className="primary-btn"
              type="button"
              onClick={() =>
                abrirPortao(
                  "PORTAO_SOCIAL"
                )
              }
            >
              <DoorOpen size={18} />
              Abrir Social
            </button>

            <button
              className="primary-btn"
              type="button"
              onClick={() =>
                abrirPortao(
                  "PORTAO_VEICULOS"
                )
              }
            >
              <Car size={18} />
              Abrir Veículos
            </button>

            <button
              className="primary-btn"
              type="button"
              onClick={() =>
                abrirPortao("CATRACA")
              }
            >
              <UserCheck size={18} />
              Liberar Catraca
            </button>
          </div>
        </div>

        <div className="panel operacional-card">
          <h2>
            <KeyRound size={20} />
            Retirada de encomenda
          </h2>

          <form
            className="operacional-inline-form"
            onSubmit={
              validarCodigoRetirada
            }
          >
            <input
              ref={codigoInputRef}
              autoFocus
              placeholder="Código de retirada"
              value={codigoRetirada}
              onChange={(e) => {
                setCodigoRetirada(
                  e.target.value
                );

                setEncomendaValidada(
                  null
                );
              }}
            />

            <button
              className="primary-btn"
              type="submit"
            >
              Validar
            </button>
          </form>

          {encomendaValidada ? (
            <div className="info-card operacional-confirm-card">
              <small>
                Conferir antes de
                entregar
              </small>

              <strong>
                {encomendaValidada.descricao ||
                  "Encomenda"}
              </strong>

              <p>
                Unidade:{" "}
                {nomeUnidade(
                  encomendaValidada.unidade
                )}
              </p>

              <button
                className="primary-btn"
                type="button"
                onClick={
                  confirmarRetirada
                }
              >
                <CheckCircle size={16} />
                Confirmar retirada
              </button>
            </div>
          ) : (
            <div className="empty operacional-empty">
              Digite o código.
            </div>
          )}
        </div>
      </section>

      <section className="operacional-grid">
        <div className="panel operacional-card">
          <h2>
            <Package size={20} />
            Registrar encomenda
          </h2>

          <form
            className="operacional-encomenda-form"
            onSubmit={
              registrarEncomenda
            }
          >
            <label className="field">
              <span>Unidade</span>

              <Dropdown
                searchable
                placeholder="Selecione"
                value={
                  formEncomenda.unidadeId
                }
                onChange={(valor) =>
                  setFormEncomenda(
                    (atual) => ({
                      ...atual,
                      unidadeId:
                        valor
                    })
                  )
                }
                options={
                  unidadesOptions
                }
              />
            </label>

            <label className="field">
              <span>Descrição</span>

              <input
                placeholder="Mercado Livre, Shopee..."
                value={
                  formEncomenda.descricao
                }
                onChange={(e) =>
                  setFormEncomenda(
                    (atual) => ({
                      ...atual,
                      descricao:
                        e.target
                          .value
                    })
                  )
                }
              />
            </label>

            <button
              className="primary-btn"
              type="submit"
              disabled={
                salvandoEncomenda
              }
            >
              <Package size={16} />

              {salvandoEncomenda
                ? "Salvando..."
                : "Registrar"}
            </button>
          </form>
        </div>

        <div className="panel operacional-card">
          <h2>
            <Bell size={20} />
            Encomendas pendentes
          </h2>

          <div className="operacional-list">
            {encomendasPendentes.length ===
            0 ? (
              <div className="empty">
                Nenhuma encomenda
                pendente.
              </div>
            ) : (
              encomendasPendentes.map(
                (e) => (
                  <div
                    key={e.id}
                    className="info-card"
                  >
                    <div className="info-card-header">
                      <div>
                        <small>
                          {formatarData(
                            e.dataRecebimento
                          )}
                        </small>

                        <strong>
                          {e.descricao ||
                            "Encomenda"}
                        </strong>

                        <p>
                          Unidade:{" "}
                          {nomeUnidade(
                            e.unidade
                          )}
                        </p>
                      </div>

                      <span
                        className={`status-pill ${statusClasse(
                          e.status
                        )}`}
                      >
                        {e.status}
                      </span>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </section>

      <section className="operacional-grid">
        <div className="panel operacional-card">
          <h2>
            <UserCheck size={20} />
            Visitantes
          </h2>

          <div className="operacional-list">
            {visitantesPendentes.length ===
            0 ? (
              <div className="empty">
                Nenhum visitante
                pendente.
              </div>
            ) : (
              visitantesPendentes.map(
                (v) => (
                  <div
                    key={v.id}
                    className="info-card"
                  >
                    <div className="info-card-header">
                      <div>
                        <small>
                          {formatarData(
                            v.dataPrevista ||
                              v.criadoEm
                          )}
                        </small>

                        <strong>
                          {v.nomeVisitante ||
                            "Visitante"}
                        </strong>

                        <p>
                          Unidade:{" "}
                          {nomeUnidade(
                            v.unidade
                          )}
                        </p>
                      </div>

                      <span
                        className={`status-pill ${statusClasse(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="panel operacional-card">
          <h2>
            <Activity size={20} />
            Eventos ao vivo
          </h2>

          <div className="operacional-feed">
            {eventos.length === 0 ? (
              <div className="empty">
                Nenhum evento.
              </div>
            ) : (
              eventos
                .slice(0, 12)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="operacional-feed-item"
                  >
                    <span>
                      {formatarData(
                        ev.dataHora ||
                          ev.criadoEm
                      )}
                    </span>

                    <strong>
                      {ev.nome ||
                        ev.tipo ||
                        "Evento"}
                    </strong>

                    <small>
                      {ev.unidade ||
                        "-"}{" "}
                      •{" "}
                      {ev.status ||
                        "-"}
                    </small>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}