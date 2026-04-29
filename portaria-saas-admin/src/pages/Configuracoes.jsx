import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";

export default function Configuracoes() {
  const [form, setForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const data = await apiFetch("/configuracoes?condominioId=1");
    setForm(data);
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar() {
    setSalvando(true);

    await apiFetch("/configuracoes", {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        condominioId: 1,
        tempoMaximoPermanenciaHoras: Number(form.tempoMaximoPermanenciaHoras || 12),
        portaDispositivoPortao: form.portaDispositivoPortao
          ? Number(form.portaDispositivoPortao)
          : null,
        tempoAberturaSegundos: Number(form.tempoAberturaSegundos || 2)
      })
    });

    setSalvando(false);
    alert("Configurações salvas com sucesso");
    carregar();
  }

  async function testarPortao() {
    await apiFetch("/portao/abrir", {
      method: "POST"
    });

    alert("Portão simulado acionado com sucesso");
  }

  useEffect(() => {
    carregar();
  }, []);

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
      description="Preferências operacionais, controle de acesso e integração do portão."
      active="/configuracoes"
      action={
        <button className="primary-btn" onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar configurações"}
        </button>
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
                value={form.tempoMaximoPermanenciaHoras}
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
              value={form.tempoAberturaSegundos}
              onChange={(e) =>
                atualizar("tempoAberturaSegundos", e.target.value)
              }
            />
          </label>
        </div>

        <div style={{ marginTop: 18 }}>
          <button className="secondary-btn" onClick={testarPortao}>
            Testar abertura do portão
          </button>
        </div>
      </section>
    </Layout>
  );
}