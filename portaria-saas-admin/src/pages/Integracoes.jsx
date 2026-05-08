import { useEffect, useState } from "react";
import {
  PlugZap,
  Save,
  Power,
  RefreshCw,
  MessageCircle
} from "lucide-react";

import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";
import { apiFetch } from "../services/api";
import { getUsuarioToken } from "../utils/auth";

const formInicial = {
  integradorId: "",

  modo: "MANUAL",
  ativo: false,

  phoneNumberId: "",
  accessToken: "",

  templateEncomenda: "encomenda_recebida",
  templateVisitante: "visitante_aguardando",
  templateAcesso: "acesso_liberado",

  templateIdioma: "pt_BR",

  fallbackManual: true
};

export default function Integracoes() {
  const usuario = getUsuarioToken();
  const isSuperAdmin = usuario?.perfil === "SUPER_ADMIN";

  const [integradores, setIntegradores] = useState([]);

  const [form, setForm] = useState(formInicial);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function atualizar(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor
    }));
  }

  async function carregarIntegradores() {
    try {
      setCarregando(true);

      const dados = await apiFetch("/integradores");

      const lista = Array.isArray(dados) ? dados : [];

      setIntegradores(lista);

      if (lista.length > 0 && !form.integradorId) {
        const primeiroId = String(lista[0].id);

        atualizar("integradorId", primeiroId);

        await carregarConfig(primeiroId);
      }
    } catch (erro) {
      console.error("Erro ao carregar integradores:", erro);
      alert("Erro ao carregar integradores.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarConfig(integradorId) {
    if (!integradorId) return;

    try {
      const config = await apiFetch(
        `/whatsapp-config/${integradorId}`
      );

      if (!config) {
        setForm({
          ...formInicial,
          integradorId: String(integradorId)
        });

        return;
      }

      setForm({
        integradorId: String(integradorId),

        modo: config.modo || "MANUAL",
        ativo: Boolean(config.ativo),

        phoneNumberId: config.phoneNumberId || "",
        accessToken: config.accessToken || "",

        templateEncomenda:
          config.templateEncomenda ||
          "encomenda_recebida",

        templateVisitante:
          config.templateVisitante ||
          "visitante_aguardando",

        templateAcesso:
          config.templateAcesso ||
          "acesso_liberado",

        templateIdioma:
          config.templateIdioma || "pt_BR",

        fallbackManual:
          config.fallbackManual ?? true
      });
    } catch (erro) {
      console.error(
        "Erro ao carregar configuração:",
        erro
      );

      alert(
        erro.message ||
          "Erro ao carregar configuração."
      );
    }
  }

  async function salvar(e) {
    e.preventDefault();

    if (!form.integradorId) {
      alert("Selecione um integrador.");
      return;
    }

    if (form.modo === "AUTOMATICO") {
      if (
        !form.phoneNumberId ||
        !form.accessToken
      ) {
        alert(
          "Preencha Phone Number ID e Access Token."
        );

        return;
      }
    }

    try {
      setSalvando(true);

      await apiFetch(
        `/whatsapp-config/${form.integradorId}`,
        {
          method: "PUT",

          body: JSON.stringify({
            modo: form.modo,
            ativo: form.ativo,

            phoneNumberId:
              form.phoneNumberId || null,

            accessToken:
              form.accessToken || null,

            templateEncomenda:
              form.templateEncomenda,

            templateVisitante:
              form.templateVisitante,

            templateAcesso:
              form.templateAcesso,

            templateIdioma:
              form.templateIdioma,

            fallbackManual:
              form.fallbackManual
          })
        }
      );

      alert("Configuração salva com sucesso.");

      await carregarConfig(form.integradorId);
    } catch (erro) {
      console.error(
        "Erro ao salvar configuração:",
        erro
      );

      alert(
        erro.message ||
          "Erro ao salvar configuração."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function desativar() {
    if (!form.integradorId) {
      alert("Selecione um integrador.");
      return;
    }

    if (
      !window.confirm(
        "Desativar integração do WhatsApp?"
      )
    ) {
      return;
    }

    try {
      await apiFetch(
        `/whatsapp-config/${form.integradorId}/desativar`,
        {
          method: "PATCH"
        }
      );

      alert("Integração desativada.");

      await carregarConfig(form.integradorId);
    } catch (erro) {
      console.error(
        "Erro ao desativar integração:",
        erro
      );

      alert(
        erro.message ||
          "Erro ao desativar integração."
      );
    }
  }

  useEffect(() => {
    carregarIntegradores();

    // eslint-disable-next-line
  }, []);

  if (!isSuperAdmin) {
    return (
      <Layout
        title="Integrações"
        active="/integracoes"
      >
        <section className="panel">
          <div className="empty">
            Apenas SUPER_ADMIN pode acessar
            integrações.
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="Integrações"
      description="Configurações de integrações externas."
      active="/integracoes"
    >
      <section className="panel">
        <div className="portaria-live-header">
          <div>
            <h2>
              <MessageCircle size={20} />
              WhatsApp Cloud API
            </h2>

            <p className="muted-text">
              Configure envio automático por
              integrador.
            </p>
          </div>

          <button
            className="secondary-btn"
            type="button"
            onClick={() =>
              carregarConfig(form.integradorId)
            }
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        <form
          className="form-grid"
          onSubmit={salvar}
        >
          <label className="field field-full">
            <span>Integrador</span>

            <Dropdown
              searchable
              placeholder="Selecione"
              value={form.integradorId}
              onChange={(valor) => {
                atualizar(
                  "integradorId",
                  valor
                );

                carregarConfig(valor);
              }}
              options={integradores.map((i) => ({
                label: i.nome,
                value: String(i.id)
              }))}
            />
          </label>

          <label className="field">
            <span>Modo</span>

            <select
              value={form.modo}
              onChange={(e) =>
                atualizar(
                  "modo",
                  e.target.value
                )
              }
            >
              <option value="MANUAL">
                Manual
              </option>

              <option value="AUTOMATICO">
                Automático
              </option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>

            <button
              type="button"
              className={`theme-switch ${
                form.ativo ? "active" : ""
              }`}
              onClick={() =>
                atualizar(
                  "ativo",
                  !form.ativo
                )
              }
            >
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>

              {form.ativo
                ? "Ativo"
                : "Inativo"}
            </button>
          </label>

          <label className="field">
            <span>Fallback manual</span>

            <button
              type="button"
              className={`theme-switch ${
                form.fallbackManual
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                atualizar(
                  "fallbackManual",
                  !form.fallbackManual
                )
              }
            >
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>

              {form.fallbackManual
                ? "Ligado"
                : "Desligado"}
            </button>
          </label>

          <label className="field">
            <span>Phone Number ID</span>

            <input
              value={form.phoneNumberId}
              onChange={(e) =>
                atualizar(
                  "phoneNumberId",
                  e.target.value
                )
              }
              placeholder="123456789"
            />
          </label>

          <label className="field field-full">
            <span>Access Token</span>

            <input
              type="password"
              value={form.accessToken}
              onChange={(e) =>
                atualizar(
                  "accessToken",
                  e.target.value
                )
              }
              placeholder="Token da API"
            />
          </label>

          <label className="field">
            <span>
              Template encomenda
            </span>

            <input
              value={form.templateEncomenda}
              onChange={(e) =>
                atualizar(
                  "templateEncomenda",
                  e.target.value
                )
              }
              placeholder="encomenda_recebida"
            />
          </label>

          <label className="field">
            <span>
              Template visitante
            </span>

            <input
              value={form.templateVisitante}
              onChange={(e) =>
                atualizar(
                  "templateVisitante",
                  e.target.value
                )
              }
              placeholder="visitante_aguardando"
            />
          </label>

          <label className="field">
            <span>
              Template acesso
            </span>

            <input
              value={form.templateAcesso}
              onChange={(e) =>
                atualizar(
                  "templateAcesso",
                  e.target.value
                )
              }
              placeholder="acesso_liberado"
            />
          </label>

          <label className="field">
            <span>Idioma</span>

            <input
              value={form.templateIdioma}
              onChange={(e) =>
                atualizar(
                  "templateIdioma",
                  e.target.value
                )
              }
              placeholder="pt_BR"
            />
          </label>

          <div className="field-full form-actions">
            <button
              className="primary-btn"
              type="submit"
              disabled={salvando}
            >
              <Save size={16} />

              {salvando
                ? "Salvando..."
                : "Salvar"}
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={desativar}
            >
              <Power size={16} />
              Desativar
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Templates recomendados</h2>

        <div className="info-list">
          <div className="info-card">
            <strong>
              encomenda_recebida
            </strong>

            <p>
              Notificação de nova
              encomenda.
            </p>
          </div>

          <div className="info-card">
            <strong>
              visitante_aguardando
            </strong>

            <p>
              Visitante aguardando
              autorização.
            </p>
          </div>

          <div className="info-card">
            <strong>
              acesso_liberado
            </strong>

            <p>
              Confirmação de acesso
              autorizado.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}