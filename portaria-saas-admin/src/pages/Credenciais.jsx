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

function tipoLabel(tipo) {
  if (tipo === "FACIAL") return "Facial";
  if (tipo === "TAG") return "Tag RFID";
  if (tipo === "SENHA") return "Senha";
  return tipo || "-";
}

export default function Credenciais() {
  const [credenciais, setCredenciais] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [form, setForm] = useState(vazio);
  const [modalAberto, setModalAberto] = useState(false);
  const [condominioFiltro, setCondominioFiltro] = useState("1");
  const [buscaPessoa, setBuscaPessoa] = useState("");

  async function carregar(id = condominioFiltro) {
    const conds = await apiFetch("/condominios");
    const listaConds = Array.isArray(conds) ? conds : [];

    setCondominios(listaConds);

    const idFinal = id || String(listaConds[0]?.id || "1");

    if (!id && listaConds[0]?.id) {
      setCondominioFiltro(String(listaConds[0].id));
    }

    const pessoasData = await apiFetch(`/pessoas?condominioId=${idFinal}`);
    setPessoas(Array.isArray(pessoasData) ? pessoasData : []);

    const credenciaisData = await apiFetch(
      `/credenciais?condominioId=${idFinal}`
    );
    setCredenciais(Array.isArray(credenciaisData) ? credenciaisData : []);
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
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

    try {
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
    } catch (erro) {
      alert(erro.message || "Erro ao salvar credencial");
    }
  }

  async function alternarStatus(credencial) {
    try {
      await apiFetch(`/credenciais/${credencial.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          ativo: !credencial.ativo
        })
      });

      setCredenciais((atual) =>
        atual.map((item) =>
          item.id === credencial.id
            ? { ...item, ativo: !credencial.ativo }
            : item
        )
      );
    } catch (erro) {
      alert(erro.message || "Erro ao alterar status da credencial");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const credenciaisFiltradas = credenciais.filter((c) => {
    const texto = `${c.pessoa?.nome || ""} ${c.identificador || ""} ${
      c.tipo || ""
    }`.toLowerCase();

    return texto.includes(buscaPessoa.toLowerCase());
  });

  const ativas = credenciais.filter((c) => c.ativo).length;

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
      <section className="panel modules-header-panel">
        <div>
          <h2>Filtro</h2>
          <p className="muted-text">
            Selecione o condomínio e filtre por pessoa, tipo ou identificador.
          </p>
        </div>

        <div className="form-grid">
          <Dropdown
            searchable
            placeholder="Condomínio"
            value={condominioFiltro}
            onChange={(val) => {
              setCondominioFiltro(val);
              setBuscaPessoa("");
              carregar(val);
            }}
            options={condominios.map((c) => ({
              label: c.nome,
              value: String(c.id)
            }))}
          />

          <input
            placeholder="Filtrar por pessoa, tipo ou identificador..."
            value={buscaPessoa}
            onChange={(e) => setBuscaPessoa(e.target.value)}
          />
        </div>
      </section>

      <section className="modules-summary">
        <div className="summary-card">
          <span>Credenciais ativas</span>
          <strong>{ativas}</strong>
        </div>

        <div className="summary-card">
          <span>Total cadastrado</span>
          <strong>{credenciais.length}</strong>
        </div>

        <div className="summary-card">
          <span>Exibindo no filtro</span>
          <strong>{credenciaisFiltradas.length}</strong>
        </div>
      </section>

      <section className="panel module-category-panel">
        <div className="module-category-header">
          <div>
            <h2>Credenciais cadastradas</h2>
            <p className="muted-text">
              Ative ou desative faciais, tags e senhas de acesso.
            </p>
          </div>
        </div>

        {credenciaisFiltradas.length === 0 ? (
          <div className="empty">Nenhuma credencial encontrada.</div>
        ) : (
          <div className="module-grid">
            {credenciaisFiltradas.map((c) => (
              <div
                key={c.id}
                className={`module-card credential-card ${
                  c.ativo ? "active" : ""
                }`}
              >
                <div className="module-card-info">
                  <strong>{c.pessoa?.nome || "Pessoa não informada"}</strong>
                  <span>
                    {tipoLabel(c.tipo)} · {c.identificador}
                  </span>
                  <small>{c.condominio?.nome || ""}</small>
                </div>

                <div className="module-card-action">
                  <span
                    className={`module-status ${
                      c.ativo ? "active" : "inactive"
                    }`}
                  >
                    {c.ativo ? "Ativa" : "Inativa"}
                  </span>

                  <button
                    type="button"
                    className={`ios-toggle ${c.ativo ? "on" : ""}`}
                    onClick={() => alternarStatus(c)}
                    aria-label={
                      c.ativo ? "Desativar credencial" : "Ativar credencial"
                    }
                  >
                    <span />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        aberto={modalAberto}
        titulo="Nova credencial"
        descricao="Vincule facial, tag ou senha a uma pessoa."
        onClose={fecharModal}
        footer={
          <>
            <button type="button" className="primary-btn" onClick={salvar}>
              Salvar credencial
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={fecharModal}
            >
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
              placeholder="Ex: código facial, tag ou senha"
              value={form.identificador}
              onChange={(e) => atualizar("identificador", e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}