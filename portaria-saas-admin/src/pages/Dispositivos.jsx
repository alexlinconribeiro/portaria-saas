import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Dropdown from "../components/Dropdown";

const vazio = {
  nome: "",
  tipo: "LEITOR_FACIAL",
  fabricante: "INTELBRAS",
  modelo: "",
  ip: "",
  porta: "80",
  localizacao: "",
  condominioId: "1"
};

export default function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [form, setForm] = useState(vazio);
  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  async function carregar() {
    const data = await apiFetch("/dispositivos?condominioId=1");
    setDispositivos(Array.isArray(data) ? data : []);
  }

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function editar(d) {
    setEditandoId(d.id);
    setForm({
      nome: d.nome || "",
      tipo: d.tipo || "LEITOR_FACIAL",
      fabricante: d.fabricante || "INTELBRAS",
      modelo: d.modelo || "",
      ip: d.ip || "",
      porta: String(d.porta || 80),
      localizacao: d.localizacao || "",
      condominioId: String(d.condominioId || 1)
    });
    setModal(true);
  }

  async function salvar() {
    if (!form.nome || !form.modelo || !form.ip) {
      alert("Nome, modelo e IP são obrigatórios");
      return;
    }

    const payload = {
      ...form,
      porta: Number(form.porta || 80),
      condominioId: Number(form.condominioId)
    };

    if (editandoId) {
      await apiFetch(`/dispositivos/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await apiFetch("/dispositivos", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }

    setModal(false);
    setEditandoId(null);
    setForm(vazio);
    carregar();
  }

  async function testar(id) {
    await apiFetch(`/dispositivos/${id}/check`, {
      method: "POST"
    });
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Layout
      title="Dispositivos"
      description="Gerencie leitores faciais e equipamentos da portaria."
      active="/dispositivos"
      action={
        <button
          className="primary-btn"
          onClick={() => {
            setEditandoId(null);
            setForm(vazio);
            setModal(true);
          }}
        >
          + Adicionar dispositivo
        </button>
      }
    >
      <section className="panel">
        <h2>Dispositivos cadastrados</h2>

        {dispositivos.length === 0 ? (
          <div className="empty">Nenhum dispositivo cadastrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Nome</th>
                <th>Modelo</th>
                <th>IP</th>
                <th>Local</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {dispositivos.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className={`status-dot ${d.status?.toLowerCase() || "desconhecido"}`} />
                  </td>

                  <td>{d.nome}</td>
                  <td>{d.modelo || "-"}</td>
                  <td>{d.ip ? `${d.ip}:${d.porta || 80}` : "-"}</td>
                  <td>{d.localizacao || "-"}</td>

                  <td>
                    <button className="table-btn" onClick={() => testar(d.id)}>
                      Testar
                    </button>

                    <button
                      className="table-btn secondary-table-btn"
                      onClick={() => editar(d)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Modal
        aberto={modal}
        titulo={editandoId ? "Editar dispositivo" : "Novo dispositivo"}
        descricao="Cadastre leitores faciais e equipamentos da portaria."
        onClose={() => setModal(false)}
        footer={
          <>
            <button className="primary-btn" onClick={salvar}>
              {editandoId ? "Salvar alterações" : "Salvar dispositivo"}
            </button>

            <button className="secondary-btn" onClick={() => setModal(false)}>
              Cancelar
            </button>
          </>
        }
      >
        <div className="form-grid">
          <label className="field">
            <span>Nome do dispositivo</span>
            <input
              placeholder="Ex: Leitor Portaria"
              value={form.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Fabricante</span>
            <Dropdown
              value={form.fabricante}
              onChange={(v) => {
                atualizar("fabricante", v);
                atualizar("modelo", "");
              }}
              options={[
                { label: "Intelbras", value: "INTELBRAS" },
                { label: "Hikvision", value: "HIKVISION" }
              ]}
            />
          </label>

          <label className="field">
            <span>Modelo</span>
            <Dropdown
              placeholder="Selecione o modelo"
              value={form.modelo}
              onChange={(v) => atualizar("modelo", v)}
              options={
                form.fabricante === "HIKVISION"
                  ? [{ label: "DS-K1T673", value: "DS-K1T673" }]
                  : [
                      { label: "SS 3530 MF FACE", value: "SS 3530 MF FACE" },
                      { label: "SS 3530 MF FACE W", value: "SS 3530 MF FACE W" },
                      { label: "SS 3540 MF FACE EX", value: "SS 3540 MF FACE EX" },
                      { label: "SS 7530 FACE", value: "SS 7530 FACE" }
                    ]
              }
            />
          </label>

          <label className="field">
            <span>IP do equipamento</span>
            <input
              placeholder="Ex: 192.168.1.50"
              value={form.ip}
              onChange={(e) => atualizar("ip", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Porta</span>
            <input
              placeholder="Ex: 80"
              value={form.porta}
              onChange={(e) => atualizar("porta", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Localização</span>
            <input
              placeholder="Ex: Portaria"
              value={form.localizacao}
              onChange={(e) => atualizar("localizacao", e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}