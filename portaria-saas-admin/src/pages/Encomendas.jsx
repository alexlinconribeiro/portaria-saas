import { useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  Search,
  CheckCircle,
  Bell,
  XCircle,
  RefreshCw,
  Copy,
  KeyRound
} from "lucide-react";

import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";
import Permissao from "../components/Permissao";
import { apiFetch } from "../services/api";
import { usuarioTemPermissao, getUsuarioToken } from "../utils/auth";

const formInicial = {
  unidadeId: "",
  descricao: "",
  codigo: "",
  remetente: "",
  observacao: ""
};

export default function Encomendas() {
  const usuario = getUsuarioToken();
  const isSuperAdmin = usuario?.perfil === "SUPER_ADMIN";
  const inputCodigoRef = useRef(null);

  const podeVer = usuarioTemPermissao("encomendas.ver");
  const podeRegistrar = usuarioTemPermissao("encomendas.registrar");
  const podeNotificar =
    usuarioTemPermissao("encomendas.notificar_morador") ||
    usuarioTemPermissao("encomendas.editar");
  const podeEntregar = usuarioTemPermissao("encomendas.entregar");
  const podeCancelar = usuarioTemPermissao("encomendas.excluir");

  const [condominios, setCondominios] = useState([]);
  const [condominioId, setCondominioId] = useState(
    usuario?.condominioId ? String(usuario.condominioId) : "1"
  );

  const [unidades, setUnidades] = useState([]);
  const [encomendas, setEncomendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(formInicial);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [codigoRetirada, setCodigoRetirada] = useState("");
  const [encomendaValidada, setEncomendaValidada] = useState(null);
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [feedbackCodigo, setFeedbackCodigo] = useState(null);
  const [modalMensagem, setModalMensagem] = useState(null);

  function nomeUnidade(unidade) {
    if (!unidade) return "-";
    return `${unidade.bloco ? `${unidade.bloco} - ` : ""}${unidade.identificacao}`;
  }

  function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
  }

  function statusClasse(valor) {
    return String(valor || "").toLowerCase();
  }

  function atualizarForm(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function tocarSom(tipo) {
    try {
      const audio = new Audio(
        tipo === "ok"
          ? "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
          : "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
      );
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch {}
  }

  async function carregar(id = condominioId) {
    if (!podeVer) return;

    try {
      setCarregando(true);

      if (isSuperAdmin) {
        const condominiosData = await apiFetch("/condominios");
        setCondominios(Array.isArray(condominiosData) ? condominiosData : []);
      }

      const unidadesData = await apiFetch(`/unidades?condominioId=${id}`);

      const params = new URLSearchParams();
      if (id) params.append("condominioId", id);
      if (status) params.append("status", status);

      const encomendasData = await apiFetch(
        `/encomendas${params.toString() ? `?${params.toString()}` : ""}`
      );

      setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
      setEncomendas(Array.isArray(encomendasData) ? encomendasData : []);
    } catch (erro) {
      alert(erro.message || "Erro ao carregar encomendas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    setTimeout(() => inputCodigoRef.current?.focus(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (condominioId) carregar(condominioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const unidadesOptions = unidades.map((u) => ({
    label: nomeUnidade(u),
    value: String(u.id)
  }));

  const encomendasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    if (!termo) return encomendas;

    return encomendas.filter((e) => {
      const texto = `
        ${e.descricao || ""}
        ${e.codigo || ""}
        ${e.codigoRetirada || ""}
        ${e.remetente || ""}
        ${e.status || ""}
        ${e.unidade?.bloco || ""}
        ${e.unidade?.identificacao || ""}
      `;
      return texto.toLowerCase().includes(termo);
    });
  }, [busca, encomendas]);

  const totalPendentes = encomendas.filter((e) => e.status === "PENDENTE").length;
  const totalNotificadas = encomendas.filter((e) => e.status === "NOTIFICADO").length;
  const totalRetiradas = encomendas.filter((e) => e.status === "RETIRADO").length;

  async function registrarEncomenda(e) {
    e.preventDefault();

    if (!condominioId) return alert("Selecione um condomínio.");
    if (!form.unidadeId && !form.descricao.trim()) {
      return alert("Informe pelo menos a unidade ou a descrição.");
    }

    try {
      setSalvando(true);

      await apiFetch("/encomendas", {
        method: "POST",
        body: JSON.stringify({
          condominioId: Number(condominioId),
          unidadeId: form.unidadeId ? Number(form.unidadeId) : null,
          descricao: form.descricao || null,
          codigo: form.codigo || null,
          remetente: form.remetente || null,
          observacao: form.observacao || null
        })
      });

      setForm(formInicial);
      await carregar(condominioId);
    } catch (erro) {
      alert(erro.message || "Erro ao registrar encomenda.");
    } finally {
      setSalvando(false);
    }
  }

  async function notificarEncomenda(id) {
    try {
      const resposta = await apiFetch(`/encomendas/${id}/notificar`, {
        method: "PATCH"
      });

      if (resposta?.whatsapp?.modoManual && resposta?.whatsapp?.mensagemManual) {
        setModalMensagem({
          titulo: "Mensagem WhatsApp",
          mensagem: resposta.whatsapp.mensagemManual
        });
      } else if (resposta?.whatsapp?.enviadoAutomaticamente) {
        alert("WhatsApp enviado automaticamente.");
      }

      await carregar(condominioId);
    } catch (erro) {
      alert(erro.message || "Erro ao notificar encomenda.");
    }
  }

  async function entregarPorId(id) {
    if (!window.confirm("Confirmar retirada desta encomenda?")) return;

    try {
      await apiFetch(`/encomendas/${id}/entregar`, { method: "PATCH" });
      await carregar(condominioId);
    } catch (erro) {
      alert(erro.message || "Erro ao retirar encomenda.");
    }
  }

  async function cancelarEncomenda(id) {
    if (!window.confirm("Cancelar esta encomenda?")) return;

    try {
      await apiFetch(`/encomendas/${id}/cancelar`, { method: "PATCH" });
      await carregar(condominioId);
    } catch (erro) {
      alert(erro.message || "Erro ao cancelar encomenda.");
    }
  }

  async function validarCodigoRetirada(e) {
    e.preventDefault();

    if (!codigoRetirada.trim()) {
      setFeedbackCodigo({ tipo: "erro", texto: "Digite o código de retirada." });
      return;
    }

    try {
      setValidandoCodigo(true);
      setEncomendaValidada(null);
      setFeedbackCodigo(null);

      const params = new URLSearchParams();
      if (condominioId) params.append("condominioId", condominioId);

      const resposta = await apiFetch(
        `/encomendas/retirada/${codigoRetirada.trim()}?${params.toString()}`
      );

      setEncomendaValidada(resposta.encomenda);
      setFeedbackCodigo({ tipo: "ok", texto: "Código válido. Confira os dados antes de entregar." });
      tocarSom("ok");
    } catch (erro) {
      setFeedbackCodigo({ tipo: "erro", texto: erro.message || "Código inválido." });
      tocarSom("erro");
    } finally {
      setValidandoCodigo(false);
    }
  }

  async function confirmarRetiradaPorCodigo() {
    if (!encomendaValidada?.codigoRetirada) return;

    if (
      !window.confirm(
        `Confirmar retirada da encomenda da unidade ${nomeUnidade(encomendaValidada.unidade)}?`
      )
    ) {
      return;
    }

    try {
      const params = new URLSearchParams();
      if (condominioId) params.append("condominioId", condominioId);

      await apiFetch(
        `/encomendas/retirada/${encomendaValidada.codigoRetirada}/confirmar?${params.toString()}`,
        { method: "PATCH" }
      );

      setCodigoRetirada("");
      setEncomendaValidada(null);
      setFeedbackCodigo({ tipo: "ok", texto: "Retirada confirmada com sucesso." });
      inputCodigoRef.current?.focus();
      await carregar(condominioId);
    } catch (erro) {
      setFeedbackCodigo({ tipo: "erro", texto: erro.message || "Erro ao confirmar retirada." });
    }
  }

  async function copiarMensagem() {
    try {
      await navigator.clipboard.writeText(modalMensagem.mensagem);
      alert("Mensagem copiada.");
    } catch {
      alert("Selecione e copie manualmente.");
    }
  }

  if (!podeVer) {
    return (
      <Layout title="Encomendas" active="/encomendas">
        <section className="panel">
          <div className="empty">Você não tem permissão para acessar encomendas.</div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="Encomendas"
      description="Controle de recebimento, notificação e retirada de encomendas."
      active="/encomendas"
    >
      {modalMensagem && (
        <div className="encomenda-modal-backdrop">
          <div className="encomenda-modal-card">
            <h2>{modalMensagem.titulo}</h2>
            <p className="muted-text">Copie a mensagem abaixo e envie pelo WhatsApp.</p>

            <textarea readOnly value={modalMensagem.mensagem} />

            <div className="encomenda-actions">
              <button className="primary-btn encomenda-btn" type="button" onClick={copiarMensagem}>
                <Copy size={15} />
                Copiar
              </button>

              <button className="secondary-btn encomenda-btn" type="button" onClick={() => setModalMensagem(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="encomendas-top-grid">
        <div className="panel encomenda-panel">
          <h2>Nova encomenda</h2>

          {isSuperAdmin && (
            <div className="encomenda-row-single">
              <Dropdown
                searchable
                placeholder="Condomínio"
                value={condominioId}
                onChange={(val) => {
                  setCondominioId(val);
                  setForm(formInicial);
                  setEncomendaValidada(null);
                  carregar(val);
                }}
                options={condominios.map((c) => ({
                  label: c.nome,
                  value: String(c.id)
                }))}
              />
            </div>
          )}

          <form className="encomenda-form" onSubmit={registrarEncomenda}>
            <label className="field">
              <span>Unidade</span>
              <Dropdown
                searchable
                placeholder="Selecione a unidade"
                value={form.unidadeId}
                onChange={(valor) => atualizarForm("unidadeId", valor)}
                options={unidadesOptions}
              />
            </label>

            <label className="field">
              <span>Descrição</span>
              <input
                placeholder="Ex: Mercado Livre, Shopee"
                value={form.descricao}
                onChange={(e) => atualizarForm("descricao", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Código da etiqueta</span>
              <input
                placeholder="Código da transportadora"
                value={form.codigo}
                onChange={(e) => atualizarForm("codigo", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Remetente</span>
              <input
                placeholder="Ex: Correios"
                value={form.remetente}
                onChange={(e) => atualizarForm("remetente", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Observação</span>
              <input
                placeholder="Observações internas"
                value={form.observacao}
                onChange={(e) => atualizarForm("observacao", e.target.value)}
              />
            </label>

            <div className="encomenda-actions compact">
              {podeRegistrar && (
                <Permissao perm="encomendas.registrar">
                  <button className="primary-btn encomenda-btn" type="submit" disabled={salvando}>
                    <Package size={15} />
                    {salvando ? "Salvando..." : "Registrar"}
                  </button>
                </Permissao>
              )}

              <button
                className="secondary-btn encomenda-btn"
                type="button"
                onClick={() => {
                  setForm(formInicial);
                  carregar(condominioId);
                }}
              >
                <RefreshCw size={15} />
                Atualizar
              </button>
            </div>
          </form>
        </div>

        <div className="panel encomenda-panel retirada-panel">
          <h2>Retirada por código</h2>

          <form className="retirada-form" onSubmit={validarCodigoRetirada}>
            <label className="field">
              <span>Código de retirada</span>
              <input
                ref={inputCodigoRef}
                placeholder="Digite o código"
                value={codigoRetirada}
                onChange={(e) => {
                  setCodigoRetirada(e.target.value);
                  setFeedbackCodigo(null);
                  setEncomendaValidada(null);
                }}
              />
            </label>

            <button className="primary-btn encomenda-btn" type="submit" disabled={validandoCodigo}>
              <KeyRound size={15} />
              {validandoCodigo ? "Validando..." : "Validar"}
            </button>
          </form>

          {feedbackCodigo && (
            <div className={`encomenda-feedback ${feedbackCodigo.tipo}`}>
              {feedbackCodigo.texto}
            </div>
          )}

          {encomendaValidada ? (
            <div className="encomenda-validada-card">
              <small>Conferência antes da retirada</small>
              <strong>{encomendaValidada.descricao || "Encomenda"}</strong>
              <span>Unidade: {nomeUnidade(encomendaValidada.unidade)}</span>
              <span>Código etiqueta: {encomendaValidada.codigo || "-"}</span>
              <span>Remetente: {encomendaValidada.remetente || "-"}</span>
              <span>Recebida: {formatarData(encomendaValidada.dataRecebimento)}</span>

              <button className="primary-btn encomenda-btn full" type="button" onClick={confirmarRetiradaPorCodigo}>
                <CheckCircle size={15} />
                Confirmar retirada
              </button>
            </div>
          ) : (
            <div className="encomenda-empty-small">
              Digite o código para localizar a encomenda.
            </div>
          )}
        </div>
      </section>

      <section className="encomendas-bottom-grid">
        <div className="panel encomenda-panel resumo-panel">
          <h2>Resumo</h2>

          <div className="resumo-grid">
            <div className="resumo-item">
              <strong>{encomendas.length}</strong>
              <span>Total</span>
            </div>
            <div className="resumo-item">
              <strong>{totalPendentes}</strong>
              <span>Pendentes</span>
            </div>
            <div className="resumo-item">
              <strong>{totalNotificadas}</strong>
              <span>Notificadas</span>
            </div>
            <div className="resumo-item">
              <strong>{totalRetiradas}</strong>
              <span>Retiradas</span>
            </div>
          </div>
        </div>

        <div className="panel encomenda-panel lista-panel">
          <div className="encomenda-list-header">
            <div>
              <h2>Encomendas registradas</h2>
              <p className="muted-text">Acompanhe o recebimento e a retirada.</p>
            </div>

            <Dropdown
              placeholder="Status"
              value={status}
              onChange={(valor) => setStatus(valor)}
              options={[
                { label: "Todos", value: "" },
                { label: "Pendente", value: "PENDENTE" },
                { label: "Notificado", value: "NOTIFICADO" },
                { label: "Retirado", value: "RETIRADO" },
                { label: "Cancelado", value: "CANCELADO" }
              ]}
            />
          </div>

          <div className="portaria-search encomenda-search">
            <Search size={15} />
            <input
              placeholder="Buscar por unidade, código, remetente ou descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {carregando ? (
            <div className="empty">Carregando encomendas...</div>
          ) : encomendasFiltradas.length === 0 ? (
            <div className="empty">Nenhuma encomenda encontrada.</div>
          ) : (
            <div className="encomenda-list">
              {encomendasFiltradas.map((e) => (
                <div key={e.id} className="encomenda-card">
                  <div className="encomenda-card-main">
                    <small>Recebida em: {formatarData(e.dataRecebimento)}</small>
                    <strong>{e.descricao || "Encomenda sem descrição"}</strong>
                    <span>Unidade: {nomeUnidade(e.unidade)}</span>
                    <span>Código etiqueta: {e.codigo || "-"}</span>
                    <span>Código retirada: {e.codigoRetirada || "-"}</span>
                    <span>Remetente: {e.remetente || "-"}</span>
                  </div>

                  <div className="encomenda-card-side">
                    <span className={`status-pill ${statusClasse(e.status)}`}>
                      {e.status}
                    </span>

                    <div className="encomenda-card-actions">
                      {e.status !== "RETIRADO" && e.status !== "CANCELADO" && podeNotificar && (
                        <button className="table-btn" type="button" onClick={() => notificarEncomenda(e.id)}>
                          <Bell size={14} />
                          Notificar
                        </button>
                      )}

                      {e.status !== "RETIRADO" && e.status !== "CANCELADO" && podeEntregar && (
                        <button className="table-btn" type="button" onClick={() => entregarPorId(e.id)}>
                          <CheckCircle size={14} />
                          Retirar
                        </button>
                      )}

                      {e.status !== "RETIRADO" && e.status !== "CANCELADO" && podeCancelar && (
                        <button className="table-btn secondary-table-btn" type="button" onClick={() => cancelarEncomenda(e.id)}>
                          <XCircle size={14} />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}