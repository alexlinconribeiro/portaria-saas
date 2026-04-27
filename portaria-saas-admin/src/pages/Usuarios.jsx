import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Dropdown from "../components/Dropdown";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { Eye, EyeOff } from "lucide-react";

const vazio = {
  nome: "",
  email: "",
  senha: "",
  perfil: "ADMIN_CONDOMINIO",
  condominioId: "",
  ativo: true
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [form, setForm] = useState(vazio);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function carregar() {
    const users = await apiFetch("/usuarios");
    const conds = await apiFetch("/condominios");

    setUsuarios(Array.isArray(users) ? users : []);
    setCondominios(Array.isArray(conds) ? conds : []);
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function abrirNovo() {
    setForm(vazio);
    setEditandoId(null);
    setModalAberto(true);
  }

  function editar(usuario) {
    setEditandoId(usuario.id);
    setForm({
      nome: usuario.nome || "",
      email: usuario.email || "",
      senha: "",
      perfil: usuario.perfil || "ADMIN_CONDOMINIO",
      condominioId: usuario.condominioId ? String(usuario.condominioId) : "",
      ativo: usuario.ativo
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(vazio);
  }

  async function salvar() {
    if (!form.nome || !form.email || !form.perfil) {
      alert("Preencha nome, email e perfil");
      return;
    }

    if (!editandoId && !form.senha) {
      alert("Senha é obrigatória para novo usuário");
      return;
    }

    const payload = {
      ...form,
      condominioId: form.condominioId ? Number(form.condominioId) : null
    };

    if (editandoId) {
      await apiFetch(`/usuarios/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await apiFetch("/usuarios", {
        method: "POST",
        body: JSON.stringify(payload)
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
      title="Usuários"
      description="Controle de acesso administrativo por perfil."
      active="/usuarios"
      action={
        <button className="primary-btn" onClick={abrirNovo}>
          + Adicionar usuário
        </button>
      }
    >
      <section className="panel">
        <h2>Usuários cadastrados</h2>

        {usuarios.length === 0 ? (
          <div className="empty">Nenhum usuário cadastrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Condomínio</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => {
                const condominio = condominios.find((c) => c.id === u.condominioId);

                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{u.perfil}</td>
                    <td>{condominio?.nome || "Todos / Sistema"}</td>
                    <td>
                      <span className={`badge ${u.ativo ? "ok" : "bad"}`}>
                        {u.ativo ? "ATIVO" : "INATIVO"}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn" onClick={() => editar(u)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <Modal
        aberto={modalAberto}
        titulo={editandoId ? "Editar usuário" : "Novo usuário"}
        descricao={
          editandoId
            ? "Altere os dados do usuário. A senha só será alterada se preenchida."
            : "Crie usuários administrativos e operacionais."
        }
        onClose={fecharModal}
        footer={
          <>
            <button className="primary-btn" onClick={salvar}>
              {editandoId ? "Salvar alterações" : "Criar usuário"}
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
              placeholder="Ex: João Silva"
              value={form.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              placeholder="Ex: joao@email.com"
              value={form.email}
              onChange={(e) => atualizar("email", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <div className="password-field">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder={editandoId ? "Nova senha opcional" : "Senha de acesso"}
                value={form.senha}
                onChange={(e) => atualizar("senha", e.target.value)}
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          <label className="field">
            <span>Perfil</span>
            <Dropdown
              placeholder="Perfil"
              value={form.perfil}
              onChange={(val) => atualizar("perfil", val)}
              options={[
                { label: "Super Admin", value: "SUPER_ADMIN" },
                { label: "Admin Condomínio", value: "ADMIN_CONDOMINIO" },
                { label: "Portaria", value: "PORTARIA" },
                { label: "Técnico", value: "TECNICO" },
                { label: "Morador", value: "MORADOR" }
              ]}
            />
          </label>

          <label className="field">
            <span>Condomínio</span>
            <Dropdown
              searchable
              placeholder="Condomínio"
              value={form.condominioId}
              onChange={(val) => atualizar("condominioId", val)}
              options={[
                { label: "Todos / Sem condomínio", value: "" },
                ...condominios.map((c) => ({
                  label: c.nome,
                  value: String(c.id)
                }))
              ]}
            />
          </label>

          <label className="field">
            <span>Status</span>
            <Dropdown
              value={String(form.ativo)}
              onChange={(val) => atualizar("ativo", val === "true")}
              options={[
                { label: "Ativo", value: "true" },
                { label: "Inativo", value: "false" }
              ]}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}
