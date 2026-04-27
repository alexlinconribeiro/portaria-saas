import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Dropdown from "../components/Dropdown";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

const vazio = {
  condominioId: "",
  unidadeId: "",
  nome: "",
  telefone: "",
  email: ""
};

export default function Moradores() {
  const [moradores, setMoradores] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [condominioFiltro, setCondominioFiltro] = useState("1");

  async function carregar(id = condominioFiltro) {
    const conds = await apiFetch("/condominios");
    setCondominios(Array.isArray(conds) ? conds : []);

    const unidadesData = await apiFetch(`/unidades?condominioId=${id}`);
    setUnidades(Array.isArray(unidadesData) ? unidadesData : []);

    const moradoresData = await apiFetch(`/moradores?condominioId=${id}`);
    setMoradores(Array.isArray(moradoresData) ? moradoresData : []);
  }

  function atualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  async function trocarCondominioFormulario(id) {
    const unidadesData = await apiFetch(`/unidades?condominioId=${id}`);
    setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
    setForm((atual) => ({ ...atual, condominioId: id, unidadeId: "" }));
  }

  function abrirNovo() {
    setForm({ ...vazio, condominioId: condominioFiltro });
    setEditandoId(null);
    setModalAberto(true);
  }

  function editar(m) {
    setEditandoId(m.id);
    setForm({
      condominioId: String(m.condominioId),
      unidadeId: String(m.unidadeId),
      nome: m.nome || "",
      telefone: m.telefone || "",
      email: m.email || ""
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(vazio);
  }

  async function salvar() {
    if (!form.condominioId || !form.unidadeId || !form.nome) {
      alert("Condomínio, unidade e nome são obrigatórios");
      return;
    }

    const payload = {
      condominioId: Number(form.condominioId),
      unidadeId: Number(form.unidadeId),
      nome: form.nome,
      telefone: form.telefone,
      email: form.email
    };

    if (editandoId) {
      await apiFetch(`/moradores/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await apiFetch("/moradores", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }

    fecharModal();
    carregar(form.condominioId);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Layout
      title="Moradores"
      description="Gerencie moradores vinculados às unidades do condomínio."
      active="/moradores"
      action={
        <button className="primary-btn" onClick={abrirNovo}>
          + Adicionar morador
        </button>
      }
    >
      <section className="panel">
        <h2>Filtro</h2>

        <div className="filters">
          <Dropdown
            searchable
            placeholder="Condomínio"
            value={condominioFiltro}
            onChange={(val) => {
              setCondominioFiltro(val);
              carregar(val);
            }}
            options={condominios.map((c) => ({
              label: c.nome,
              value: String(c.id)
            }))}
          />
        </div>
      </section>

      <section className="panel logs-panel">
        <h2>Moradores cadastrados</h2>

        {moradores.length === 0 ? (
          <div className="empty">Nenhum morador cadastrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Unidade</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {moradores.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nome}</td>
                  <td>
                    {m.unidade
                      ? `${m.unidade.bloco || ""} ${m.unidade.identificacao}`.trim()
                      : "-"}
                  </td>
                  <td>{m.telefone || "-"}</td>
                  <td>{m.email || "-"}</td>
                  <td>
                    <span className={`badge ${m.ativo ? "ok" : "bad"}`}>
                      {m.ativo ? "ATIVO" : "INATIVO"}
                    </span>
                  </td>
                  <td>
                    <button className="table-btn" onClick={() => editar(m)}>
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
        aberto={modalAberto}
        titulo={editandoId ? "Editar morador" : "Novo morador"}
        descricao="Vincule o morador a uma unidade do condomínio."
        onClose={fecharModal}
        footer={
          <>
            <button className="primary-btn" onClick={salvar}>
              {editandoId ? "Salvar alterações" : "Criar morador"}
            </button>

            <button className="secondary-btn" onClick={fecharModal}>
              Cancelar
            </button>
          </>
        }
      >
        <div className="form-grid">
          <label className="field">
            <span>Condomínio</span>
            <Dropdown
              searchable
              placeholder="Condomínio"
              value={form.condominioId}
              onChange={(val) => trocarCondominioFormulario(val)}
              options={condominios.map((c) => ({
                label: c.nome,
                value: String(c.id)
              }))}
            />
          </label>

          <label className="field">
            <span>Unidade / Apartamento</span>
            <Dropdown
              searchable
              placeholder="Unidade"
              value={form.unidadeId}
              onChange={(val) => atualizar("unidadeId", val)}
              options={unidades.map((u) => ({
                label: `${u.bloco || ""} ${u.identificacao}`.trim(),
                value: String(u.id)
              }))}
            />
          </label>

          <label className="field">
            <span>Nome do morador</span>
            <input
              placeholder="Ex: Alex Ribeiro"
              value={form.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Telefone</span>
            <input
              placeholder="Ex: 48999999999"
              value={form.telefone}
              onChange={(e) => atualizar("telefone", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              placeholder="Ex: alex@email.com"
              value={form.email}
              onChange={(e) => atualizar("email", e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}