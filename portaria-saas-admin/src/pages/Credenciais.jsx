import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Dropdown from "../components/Dropdown";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

const vazio = {
  condominioId: "1",
  pessoaId: "",
  tipo: "FACIAL",
  identificador: ""
};

export default function Credenciais() {
  const [credenciais, setCredenciais] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [form, setForm] = useState(vazio);
  const [modalAberto, setModalAberto] = useState(false);
  const [condominioFiltro, setCondominioFiltro] = useState("1");

  async function carregar(id = condominioFiltro) {
    const conds = await apiFetch("/condominios");
    setCondominios(Array.isArray(conds) ? conds : []);

    const pessoasData = await apiFetch(`/pessoas?condominioId=${id}`);
    setPessoas(Array.isArray(pessoasData) ? pessoasData : []);

    const credenciaisData = await apiFetch(`/credenciais?condominioId=${id}`);
    setCredenciais(Array.isArray(credenciaisData) ? credenciaisData : []);
  }

  function atualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  async function trocarCondominioFormulario(id) {
    const pessoasData = await apiFetch(`/pessoas?condominioId=${id}`);
    setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
    setForm((atual) => ({ ...atual, condominioId: id, pessoaId: "" }));
  }

  function abrirNovo() {
    setForm({ ...vazio, condominioId: condominioFiltro });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setForm(vazio);
  }

  async function salvar() {
    if (!form.pessoaId || !form.tipo || !form.identificador) {
      alert("Pessoa, tipo e identificador são obrigatórios");
      return;
    }

    await apiFetch("/credenciais", {
      method: "POST",
      body: JSON.stringify({
        pessoaId: Number(form.pessoaId),
        tipo: form.tipo,
        identificador: form.identificador
      })
    });

    fecharModal();
    carregar(form.condominioId);
  }

  async function desativar(id) {
    if (!confirm("Deseja desativar esta credencial?")) return;

    await apiFetch(`/credenciais/${id}/desativar`, {
      method: "PUT"
    });

    carregar(condominioFiltro);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Layout
      title="Faciais / Tags"
      description="Gerencie credenciais de acesso vinculadas às pessoas."
      active="/credenciais"
      action={
        <button className="primary-btn" onClick={abrirNovo}>
          + Adicionar credencial
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
        <h2>Credenciais cadastradas</h2>

        {credenciais.length === 0 ? (
          <div className="empty">Nenhuma credencial cadastrada.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pessoa</th>
                <th>Tipo</th>
                <th>Identificador</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {credenciais.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.pessoa?.nome || "-"}</td>
                  <td>{c.tipo}</td>
                  <td>{c.identificador}</td>
                  <td>
                    <span className={`badge ${c.ativo ? "ok" : "bad"}`}>
                      {c.ativo ? "ATIVA" : "INATIVA"}
                    </span>
                  </td>
                  <td>
                    {c.ativo && (
                      <button className="table-btn" onClick={() => desativar(c.id)}>
                        Desativar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Modal
        aberto={modalAberto}
        titulo="Nova credencial"
        descricao="Vincule facial, tag ou senha a uma pessoa."
        onClose={fecharModal}
        footer={
          <>
            <button className="primary-btn" onClick={salvar}>
              Salvar credencial
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
            <span>Pessoa</span>
            <Dropdown
              searchable
              placeholder="Pessoa"
              value={form.pessoaId}
              onChange={(val) => atualizar("pessoaId", val)}
              options={pessoas.map((p) => ({
                label: `${p.nome} - ${p.tipo}`,
                value: String(p.id)
              }))}
            />
          </label>

          <label className="field">
            <span>Tipo</span>
            <Dropdown
              placeholder="Tipo"
              value={form.tipo}
              onChange={(val) => atualizar("tipo", val)}
              options={[
                { label: "Facial", value: "FACIAL" },
                { label: "Tag RFID", value: "TAG" },
                { label: "Senha", value: "SENHA" }
              ]}
            />
          </label>

          <label className="field">
            <span>Identificador</span>
            <input
              placeholder="Ex: face_123456, UID da tag ou senha"
              value={form.identificador}
              onChange={(e) => atualizar("identificador", e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}
