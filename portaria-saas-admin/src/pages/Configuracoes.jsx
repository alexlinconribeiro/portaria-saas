import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";
import Permissao from "../components/Permissao";
import { getUsuarioToken } from "../utils/auth";
import { carregarTema as aplicarTemaSistema } from "../utils/themeLoader";

export default function Configuracoes() {
  const usuario = getUsuarioToken();
  const condominioId = usuario?.condominioId || 1;

  const [form, setForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [integradores, setIntegradores] = useState([]);
  const [integradorSelecionado, setIntegradorSelecionado] = useState("");
  const [tema, setTema] = useState(null);

  const [temaForm, setTemaForm] = useState({
    nomeSistema: "",
    primaryColor: "#2563eb",
    primarySoftColor: "#eff6ff",
    sidebarColor: "#111827",
    bgColor: "#f5f7fb",
    cardColor: "#ffffff",
    textColor: "#172033",
    mutedColor: "#64748b",
    borderColor: "#e5e7eb"
  });

  async function carregar() {
    const data = await apiFetch(`/configuracoes?condominioId=${condominioId}`);
    setForm(data);
  }

  async function carregarIntegradores() {
    const data = await apiFetch("/integradores");
    const lista = Array.isArray(data) ? data : [];

    setIntegradores(lista);

    if (lista[0]?.id) {
      setIntegradorSelecionado(String(lista[0].id));
    }
  }

  async function carregarTema(integradorId) {
    if (!integradorId) return;

    const data = await apiFetch(`/tema/integrador/${integradorId}`);

    setTema(data);

    setTemaForm({
      nomeSistema: data.nomeSistema || "",
      primaryColor: data.cores?.primary || "#2563eb",
      primarySoftColor: data.cores?.primarySoft || "#eff6ff",
      sidebarColor: data.cores?.sidebar || "#111827",
      bgColor: data.cores?.bg || "#f5f7fb",
      cardColor: data.cores?.card || "#ffffff",
      textColor: data.cores?.text || "#172033",
      mutedColor: data.cores?.muted || "#64748b",
      borderColor: data.cores?.border || "#e5e7eb"
    });
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarTema(campo, valor) {
    setTemaForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvarConfiguracoesGerais() {
    try {
      setSalvando(true);

      await apiFetch("/configuracoes", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          condominioId,
          tempoMaximoPermanenciaHoras: Number(
            form.tempoMaximoPermanenciaHoras || 12
          ),
          portaDispositivoPortao: form.portaDispositivoPortao
            ? Number(form.portaDispositivoPortao)
            : null,
          tempoAberturaSegundos: Number(form.tempoAberturaSegundos || 2)
        })
      });

      await carregar();
      alert("Configurações salvas com sucesso");
    } catch (erro) {
      console.error("Erro ao salvar configurações:", erro);
      alert("Erro ao salvar configurações");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarWhiteLabel() {
    if (!tema?.integradorId) {
      alert("Selecione um integrador.");
      return;
    }

    try {
      setSalvando(true);

      await apiFetch(`/tema/integrador/${tema.integradorId}`, {
        method: "PUT",
        body: JSON.stringify(temaForm)
      });

      await carregarTema(tema.integradorId);
      await aplicarTemaSistema();

      alert("White Label salvo com sucesso");
    } catch (erro) {
      console.error("Erro ao salvar White Label:", erro);
      alert("Erro ao salvar White Label");
    } finally {
      setSalvando(false);
    }
  }

  async function uploadLogo(e) {
    const file = e.target.files?.[0];

    if (!file || !tema?.integradorId) return;

    const formatosPermitidos = ["image/png", "image/jpeg", "image/svg+xml"];
    const tamanhoMaximo = 1024 * 1024;

    if (!formatosPermitidos.includes(file.type)) {
      alert("Formato inválido. Use PNG, JPG ou SVG.");
      return;
    }

    if (file.size > tamanhoMaximo) {
      alert("Logo muito grande. Envie uma imagem com no máximo 1 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);

    await fetch(`/api/tema/integrador/${tema.integradorId}/logo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    await carregarTema(tema.integradorId);
    await aplicarTemaSistema();
  }

  async function uploadFavicon(e) {
    const file = e.target.files?.[0];

    if (!file || !tema?.integradorId) return;

    const formatosPermitidos = [
      "image/png",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/svg+xml"
    ];
    const tamanhoMaximo = 512 * 1024;

    if (!formatosPermitidos.includes(file.type)) {
      alert("Formato inválido. Use PNG, ICO ou SVG.");
      return;
    }

    if (file.size > tamanhoMaximo) {
      alert("Favicon muito grande. Envie um arquivo com no máximo 512 KB.");
      return;
    }

    const formData = new FormData();
    formData.append("favicon", file);

    await fetch(`/api/tema/integrador/${tema.integradorId}/favicon`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    await carregarTema(tema.integradorId);
    await aplicarTemaSistema();
  }

  async function testarPortao() {
    try {
      await apiFetch("/portao/abrir", {
        method: "POST"
      });

      alert("Portão simulado acionado com sucesso");
    } catch (erro) {
      console.error("Erro ao testar portão:", erro);
      alert("Erro ao testar abertura do portão");
    }
  }

  useEffect(() => {
    carregar();
    carregarIntegradores();
  }, []);

  useEffect(() => {
    if (integradorSelecionado) {
      carregarTema(integradorSelecionado);
    }
  }, [integradorSelecionado]);

  if (!form) {
    return (
      <Layout
        title="Configurações"
        description="Preferências operacionais do sistema."
        active="/configuracoes"
      >
        <section className="panel">
          <div className="empty">Carregando configurações...</div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="Configurações"
      description="Preferências operacionais, controle de acesso, portão e White Label."
      active="/configuracoes"
      action={
        <Permissao perm="configuracoes.editar">
          <button
            className="primary-btn"
            onClick={salvarConfiguracoesGerais}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar configurações"}
          </button>
        </Permissao>
      }
    >
      <section className="grid">
        <div className="panel">
          <h2>Comportamento da portaria</h2>

          <div className="form-grid">
            <label className="field">
              <span>Tempo máximo de permanência (horas)</span>
              <input
                type="number"
                min="1"
                value={form.tempoMaximoPermanenciaHoras ?? ""}
                onChange={(e) =>
                  atualizar("tempoMaximoPermanenciaHoras", e.target.value)
                }
              />
            </label>

            <label className="field">
              <span>Entrada sem autorização</span>
              <Dropdown
                value={String(form.permitirEntradaSemAutorizacao)}
                onChange={(v) =>
                  atualizar("permitirEntradaSemAutorizacao", v === "true")
                }
                options={[
                  { label: "Não permitir", value: "false" },
                  { label: "Permitir", value: "true" }
                ]}
              />
            </label>

            <label className="field">
              <span>Exigir unidade</span>
              <Dropdown
                value={String(form.exigirUnidade)}
                onChange={(v) => atualizar("exigirUnidade", v === "true")}
                options={[
                  { label: "Sim", value: "true" },
                  { label: "Não", value: "false" }
                ]}
              />
            </label>

            <label className="field">
              <span>Exigir morador responsável</span>
              <Dropdown
                value={String(form.exigirMoradorResponsavel)}
                onChange={(v) =>
                  atualizar("exigirMoradorResponsavel", v === "true")
                }
                options={[
                  { label: "Sim", value: "true" },
                  { label: "Não", value: "false" }
                ]}
              />
            </label>
          </div>
        </div>

        <div className="panel">
          <h2>Controle de acesso</h2>

          <div className="form-grid">
            <label className="field">
              <span>Abrir portão automaticamente</span>
              <Dropdown
                value={String(form.abrirPortaoAutomaticamente)}
                onChange={(v) =>
                  atualizar("abrirPortaoAutomaticamente", v === "true")
                }
                options={[
                  { label: "Não", value: "false" },
                  { label: "Sim", value: "true" }
                ]}
              />
            </label>

            <label className="field">
              <span>Registrar entrada automaticamente</span>
              <Dropdown
                value={String(form.registrarEntradaAutomaticamente)}
                onChange={(v) =>
                  atualizar("registrarEntradaAutomaticamente", v === "true")
                }
                options={[
                  { label: "Sim", value: "true" },
                  { label: "Não", value: "false" }
                ]}
              />
            </label>

            <label className="field">
              <span>Exigir confirmação do porteiro</span>
              <Dropdown
                value={String(form.exigirConfirmacaoPorteiro)}
                onChange={(v) =>
                  atualizar("exigirConfirmacaoPorteiro", v === "true")
                }
                options={[
                  { label: "Sim", value: "true" },
                  { label: "Não", value: "false" }
                ]}
              />
            </label>

            <label className="field">
              <span>Permitir entrada direta</span>
              <Dropdown
                value={String(form.permitirEntradaDireta)}
                onChange={(v) =>
                  atualizar("permitirEntradaDireta", v === "true")
                }
                options={[
                  { label: "Não", value: "false" },
                  { label: "Sim", value: "true" }
                ]}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Portão</h2>

        <div className="form-grid">
          <label className="field">
            <span>Tipo de acionamento</span>
            <Dropdown
              value={form.tipoAcionamentoPortao}
              onChange={(v) => atualizar("tipoAcionamentoPortao", v)}
              options={[
                { label: "Simulado", value: "SIMULADO" },
                { label: "HTTP", value: "HTTP" },
                { label: "Relé", value: "RELE" },
                { label: "API", value: "API" }
              ]}
            />
          </label>

          <label className="field">
            <span>IP do dispositivo</span>
            <input
              placeholder="Ex: 192.168.1.50"
              value={form.ipDispositivoPortao || ""}
              onChange={(e) => atualizar("ipDispositivoPortao", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Porta do dispositivo</span>
            <input
              type="number"
              placeholder="Ex: 80"
              value={form.portaDispositivoPortao || ""}
              onChange={(e) =>
                atualizar("portaDispositivoPortao", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Tempo de abertura (segundos)</span>
            <input
              type="number"
              min="1"
              value={form.tempoAberturaSegundos ?? ""}
              onChange={(e) =>
                atualizar("tempoAberturaSegundos", e.target.value)
              }
            />
          </label>
        </div>

        <div style={{ marginTop: 18 }}>
          <Permissao perm="portaria.abrir_portao">
            <button className="secondary-btn" onClick={testarPortao}>
              Testar abertura do portão
            </button>
          </Permissao>
        </div>
      </section>

      <section className="panel">
        <h2>White Label</h2>

        <div className="form-grid">
          <label className="field">
            <span>Integrador</span>
            <Dropdown
              searchable
              placeholder="Selecione o integrador"
              value={integradorSelecionado}
              onChange={(v) => setIntegradorSelecionado(v)}
              options={integradores.map((i) => ({
                label: i.nome,
                value: String(i.id)
              }))}
            />
          </label>

          <label className="field">
            <span>Nome do sistema</span>
            <input
              value={temaForm.nomeSistema}
              onChange={(e) => atualizarTema("nomeSistema", e.target.value)}
              placeholder="Ex: ALX Portaria"
            />
          </label>

          <label className="field upload-field">
            <span>Logo do sistema</span>

            <div className="upload-box">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={uploadLogo}
              />
              <small>PNG, JPG ou SVG · recomendado 300x80 px · máximo 1 MB</small>
            </div>

            {tema?.logoUrl && (
              <div className="brand-preview">
                <img src={tema.logoUrl} alt="Logo" />
              </div>
            )}
          </label>

          <label className="field upload-field">
            <span>Favicon</span>

            <div className="upload-box">
              <input
                type="file"
                accept=".png,.ico,.svg"
                onChange={uploadFavicon}
              />
              <small>PNG, ICO ou SVG · recomendado 64x64 px · máximo 512 KB</small>
            </div>

            {tema?.faviconUrl && (
              <div className="favicon-preview">
                <img src={tema.faviconUrl} alt="Favicon" />
              </div>
            )}
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Cores do White Label</h2>

        <div className="form-grid">
          <label className="field">
            <span>Cor principal</span>
            <input
              type="color"
              value={temaForm.primaryColor}
              onChange={(e) => atualizarTema("primaryColor", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Fundo suave da cor principal</span>
            <input
              type="color"
              value={temaForm.primarySoftColor}
              onChange={(e) =>
                atualizarTema("primarySoftColor", e.target.value)
              }
            />
          </label>

          <label className="field">
            <span>Sidebar</span>
            <input
              type="color"
              value={temaForm.sidebarColor}
              onChange={(e) => atualizarTema("sidebarColor", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Fundo geral</span>
            <input
              type="color"
              value={temaForm.bgColor}
              onChange={(e) => atualizarTema("bgColor", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Cards</span>
            <input
              type="color"
              value={temaForm.cardColor}
              onChange={(e) => atualizarTema("cardColor", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Texto principal</span>
            <input
              type="color"
              value={temaForm.textColor}
              onChange={(e) => atualizarTema("textColor", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Texto secundário</span>
            <input
              type="color"
              value={temaForm.mutedColor}
              onChange={(e) => atualizarTema("mutedColor", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Bordas</span>
            <input
              type="color"
              value={temaForm.borderColor}
              onChange={(e) => atualizarTema("borderColor", e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginTop: 18 }}>
          <Permissao perm="integradores.editar">
            <button
              className="primary-btn"
              onClick={salvarWhiteLabel}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar White Label"}
            </button>
          </Permissao>
        </div>
      </section>
    </Layout>
  );
}