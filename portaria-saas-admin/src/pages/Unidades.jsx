import Permissao from "../components/Permissao";
import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Dropdown from "../components/Dropdown";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

const vazio = {
  condominioId: "",
  bloco: "",
  identificacao: ""
};

export default function Unidades() {
  const [unidades, setUnidades] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [condominioFiltro, setCondominioFiltro] = useState("1");

  async function carregar(id = condominioFiltro) {
    const conds = await apiFetch("/condominios");
    setCondominios(Array.isArray(conds) ? conds : []);

    if (id) {
      const data = await apiFetch(`/unidades?condominioId=${id}`);
      setUnidades(Array.isArray(data) ? data : []);
    }
  }

  function atualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function abrirNovo() {
    setForm({
      ...vazio,
      condominioId: condominioFiltro
    });
    setEditandoId(null);
    setModalAberto(true);
  }

  function editar(u) {
    setEditandoId(u.id);
    setForm({
      condominioId: String(u.condominioId),
      bloco: u.bloco || "",
      identificacao: u.identificacao || ""
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditandoId(null);
    setForm(vazio);
  }

  async function salvar() {
    if (!form.condominioId || !form.identificacao) {
      alert("Condomínio e unidade são obrigatórios");
      return;
    }

    if (editandoId) {
      await apiFetch(`/unidades/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify({
          bloco: form.bloco,
          identificacao: form.identificacao
        })
      });
    } else {
      await apiFetch("/unidades", {
        method: "POST",
        body: JSON.stringify({
          condominioId: Number(form.condominioId),
          bloco: form.bloco,
          identificacao: form.identificacao
        })
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
      title="Unidades / Blocos"
      description="Gerencie apartamentos, casas, blocos e torres."
      active="/unidades"
      action={
        <Permissao perm="unidades.criar">
		<button className="primary-btn" onClick={abrirNovo}>
			+ Adicionar unidade
		</button>
		</Permissao>
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
        <h2>Unidades cadastradas</h2>

        {unidades.length === 0 ? (
          <div className="empty">Nenhuma unidade cadastrada.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bloco / Torre</th>
                <th>Unidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {unidades.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.bloco || "-"}</td>
                  <td>{u.identificacao}</td>
                  <td>
                    <span className={`badge ${u.ativo ? "ok" : "bad"}`}>
                      {u.ativo ? "ATIVO" : "INATIVO"}
                    </span>
                  </td>
                  <td>
					<Permissao perm="unidades.editar">
					<button className="table-btn" onClick={() => editar(u)}>
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
        titulo={editandoId ? "Editar unidade" : "Nova unidade"}
        descricao="Cadastre apartamento, casa, sala ou unidade do condomínio."
        onClose={fecharModal}
        footer={
          <>
            <Permissao perm={editandoId ? "unidades.editar" : "unidades.criar"}>
				<button className="primary-btn" onClick={salvar}>
					{editandoId ? "Salvar alterações" : "Criar unidade"}
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
            <span>Condomínio</span>
            <Dropdown
              searchable
              placeholder="Condomínio"
              value={form.condominioId}
              onChange={(val) => atualizar("condominioId", val)}
              options={condominios.map((c) => ({
                label: c.nome,
                value: String(c.id)
              }))}
            />
          </label>

          <label className="field">
            <span>Bloco / Torre</span>
            <input
              placeholder="Ex: A, Torre 1, G1"
              value={form.bloco}
              onChange={(e) => atualizar("bloco", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Unidade / Apartamento</span>
            <input
              placeholder="Ex: 302"
              value={form.identificacao}
              onChange={(e) => atualizar("identificacao", e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}