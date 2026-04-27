import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

const vazio = {
  nome: "",
  documento: "",
  telefone: "",
  email: "",
  responsavel: "",
  cep: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: ""
};

export default function Condominios() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  async function carregar() {
    const data = await apiFetch("/condominios");
    setLista(Array.isArray(data) ? data : []);
  }

  function atualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function abrirNovo() {
    setForm(vazio);
    setEditandoId(null);
    setModalAberto(true);
  }

  function editar(c) {
    setEditandoId(c.id);
    setForm({
      nome: c.nome || "",
      documento: c.documento || "",
      telefone: c.telefone || "",
      email: c.email || "",
      responsavel: c.responsavel || "",
      cep: c.cep || "",
      endereco: c.endereco || "",
      numero: c.numero || "",
      bairro: c.bairro || "",
      cidade: c.cidade || "",
      estado: c.estado || ""
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(vazio);
  }

  async function salvar() {
    if (!form.nome) {
      alert("Nome é obrigatório");
      return;
    }

    if (editandoId) {
      await apiFetch(`/condominios/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch("/condominios", {
        method: "POST",
        body: JSON.stringify(form)
      });
    }

    fecharModal();
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Layout
      title="Condomínios"
      description="Cadastre e gerencie clientes da plataforma."
      active="/condominios"
      action={
        <button className="primary-btn" onClick={abrirNovo}>
          + Adicionar condomínio
        </button>
      }
    >
      <section className="panel">
        <h2>Condomínios cadastrados</h2>

        {lista.length === 0 ? (
          <div className="empty">Nenhum condomínio cadastrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Documento</th>
                <th>Responsável</th>
                <th>Cidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nome}</td>
                  <td>{c.documento || "-"}</td>
                  <td>{c.responsavel || "-"}</td>
                  <td>{c.cidade || "-"}</td>
                  <td>
                    <span className={`badge ${c.ativo ? "ok" : "bad"}`}>
                      {c.ativo ? "ATIVO" : "INATIVO"}
                    </span>
                  </td>
                  <td>
                    <button className="table-btn" onClick={() => editar(c)}>
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
        titulo={editandoId ? "Editar condomínio" : "Novo condomínio"}
        descricao="Preencha os dados cadastrais do condomínio."
        onClose={fecharModal}
        footer={
          <>
            <button className="primary-btn" onClick={salvar}>
              {editandoId ? "Salvar alterações" : "Criar condomínio"}
            </button>

            <button className="secondary-btn" onClick={fecharModal}>
              Cancelar
            </button>
          </>
        }
      >
        <div className="form-grid">
          <label className="field">
            <span>Nome</span>
            <input
              placeholder="Ex: Residencial Alpha"
              value={form.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
            />
          </label>

          <label className="field">
            <span>CNPJ / Documento</span>
            <input
              placeholder="Ex: 00.000.000/0001-00"
              value={form.documento}
              onChange={(e) => atualizar("documento", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Telefone</span>
            <input
              placeholder="Ex: 4833334444"
              value={form.telefone}
              onChange={(e) => atualizar("telefone", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              placeholder="Ex: contato@condominio.com"
              value={form.email}
              onChange={(e) => atualizar("email", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Responsável</span>
            <input
              placeholder="Ex: João Silva"
              value={form.responsavel}
              onChange={(e) => atualizar("responsavel", e.target.value)}
            />
          </label>

          <label className="field">
            <span>CEP</span>
            <input
              placeholder="Ex: 88000000"
              value={form.cep}
              onChange={(e) => atualizar("cep", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Endereço</span>
            <input
              placeholder="Ex: Rua Principal"
              value={form.endereco}
              onChange={(e) => atualizar("endereco", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Número</span>
            <input
              placeholder="Ex: 100"
              value={form.numero}
              onChange={(e) => atualizar("numero", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Bairro</span>
            <input
              placeholder="Ex: Centro"
              value={form.bairro}
              onChange={(e) => atualizar("bairro", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Cidade</span>
            <input
              placeholder="Ex: Florianópolis"
              value={form.cidade}
              onChange={(e) => atualizar("cidade", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Estado</span>
            <input
              placeholder="Ex: SC"
              value={form.estado}
              onChange={(e) => atualizar("estado", e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}