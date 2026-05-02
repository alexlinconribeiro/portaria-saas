import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Permissao from "../components/Permissao";

const vazio = {
  nome: "",
  slug: "",
  dominio: "",
  ativo: true
};

export default function Integradores() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  async function carregar() {
    const data = await apiFetch("/integradores");
    setLista(Array.isArray(data) ? data : []);
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function gerarSlug(nome) {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function abrirNovo() {
    setForm(vazio);
    setEditandoId(null);
    setModalAberto(true);
  }

  function editar(i) {
    setEditandoId(i.id);
    setForm({
      nome: i.nome || "",
      slug: i.slug || "",
      dominio: i.dominio || "",
      ativo: i.ativo
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(vazio);
  }

  async function salvar() {
    if (!form.nome || !form.slug) {
      alert("Nome e slug são obrigatórios");
      return;
    }

    if (editandoId) {
      await apiFetch(`/integradores/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
    } else {
      await apiFetch("/integradores", {
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
      title="Integradores"
      description="Gerencie marcas, parceiros e white label da plataforma."
      active="/integradores"
      action={
        <Permissao perm="integradores.criar">
          <button className="primary-btn" onClick={abrirNovo}>
            + Adicionar integrador
          </button>
        </Permissao>
      }
    >
      <section className="panel">
        <h2>Integradores cadastrados</h2>

        {lista.length === 0 ? (
          <div className="empty">Nenhum integrador cadastrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Slug</th>
                <th>Domínio</th>
                <th>Condomínios</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((i) => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td>{i.nome}</td>
                  <td>{i.slug}</td>
                  <td>{i.dominio || "-"}</td>
                  <td>{i._count?.condominios || 0}</td>
                  <td>
                    <span className={`badge ${i.ativo ? "ok" : "bad"}`}>
                      {i.ativo ? "ATIVO" : "INATIVO"}
                    </span>
                  </td>
                  <td>
                    <Permissao perm="integradores.editar">
                      <button className="table-btn" onClick={() => editar(i)}>
                        Editar
                      </button>
                    </Permissao>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Modal
        aberto={modalAberto}
        titulo={editandoId ? "Editar integrador" : "Novo integrador"}
        descricao="Cadastre o parceiro responsável pelo white label."
        onClose={fecharModal}
        footer={
          <>
            <Permissao
              perm={editandoId ? "integradores.editar" : "integradores.criar"}
            >
              <button className="primary-btn" onClick={salvar}>
                {editandoId ? "Salvar alterações" : "Criar integrador"}
              </button>
            </Permissao>

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
              placeholder="Ex: ALX Networks"
              value={form.nome}
              onChange={(e) => {
                const nome = e.target.value;
                atualizar("nome", nome);

                if (!editandoId) {
                  atualizar("slug", gerarSlug(nome));
                }
              }}
            />
          </label>

          <label className="field">
            <span>Slug</span>
            <input
              placeholder="Ex: alx-networks"
              value={form.slug}
              onChange={(e) => atualizar("slug", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Domínio/Subdomínio</span>
            <input
              placeholder="Ex: portaria.alxnetworks.com.br"
              value={form.dominio}
              onChange={(e) => atualizar("dominio", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={String(form.ativo)}
              onChange={(e) => atualizar("ativo", e.target.value === "true")}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>
        </div>
      </Modal>
    </Layout>
  );
}
