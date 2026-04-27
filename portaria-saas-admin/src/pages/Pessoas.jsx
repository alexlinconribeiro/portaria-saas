import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Dropdown from "../components/Dropdown";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

const vazio = {
  condominioId: "1",
  unidadeId: "",
  nome: "",
  documento: "",
  rg: "",
  telefone: "",
  email: "",
  tipo: "MORADOR",
  funcao: "",
  observacao: "",
  validadeInicio: "",
  validadeFim: ""
};

export default function Pessoas() {
  const [pessoas, setPessoas] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [form, setForm] = useState(vazio);
  const [modalAberto, setModalAberto] = useState(false);
  const [condominioFiltro, setCondominioFiltro] = useState("1");

  const isMorador = form.tipo === "MORADOR";
  const isFuncionario = form.tipo === "FUNCIONARIO";
  const isTerceiro = form.tipo === "TERCEIRO" || form.tipo === "PRESTADOR";

  async function carregar(condominioId = condominioFiltro) {
    const conds = await apiFetch("/condominios");
    setCondominios(Array.isArray(conds) ? conds : []);

    const unid = await apiFetch(`/unidades?condominioId=${condominioId}`);
    setUnidades(Array.isArray(unid) ? unid : []);

    const data = await apiFetch(`/pessoas?condominioId=${condominioId}`);
    setPessoas(Array.isArray(data) ? data : []);
  }

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function trocarCondominio(id) {
    const unid = await apiFetch(`/unidades?condominioId=${id}`);
    setUnidades(Array.isArray(unid) ? unid : []);
    setForm((atual) => ({ ...atual, condominioId: id, unidadeId: "" }));
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
    if (!form.nome || !form.condominioId || !form.tipo) {
      alert("Nome, condomínio e tipo são obrigatórios");
      return;
    }

    if (isMorador && !form.unidadeId) {
      alert("Para morador, informe a unidade");
      return;
    }

    const payload = {
      ...form,
      condominioId: Number(form.condominioId),
      unidadeId: isMorador && form.unidadeId ? Number(form.unidadeId) : null,
      validadeInicio: form.validadeInicio || null,
      validadeFim: form.validadeFim || null
    };

    await apiFetch("/pessoas", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    fecharModal();
    carregar(form.condominioId);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Layout
      title="Pessoas"
      description="Cadastro central de moradores, funcionários, terceiros e prestadores."
      active="/pessoas"
      action={
        <button className="primary-btn" onClick={abrirNovo}>
          + Adicionar pessoa
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
        <h2>Pessoas cadastradas</h2>

        {pessoas.length === 0 ? (
          <div className="empty">Nenhuma pessoa cadastrada.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Unidade</th>
                <th>Função</th>
                <th>Telefone</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {pessoas.map((p) => {
                const unidade = p.unidades?.[0]?.unidade;

                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome}</td>
                    <td>{p.tipo}</td>
                    <td>{p.documento || "-"}</td>
                    <td>
                      {unidade
                        ? `${unidade.bloco || ""} ${unidade.identificacao}`.trim()
                        : "-"}
                    </td>
                    <td>{p.funcao || "-"}</td>
                    <td>{p.telefone || "-"}</td>
                    <td>
                      <span className={`badge ${p.ativo ? "ok" : "bad"}`}>
                        {p.ativo ? "ATIVO" : "INATIVO"}
                      </span>
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
        titulo="Nova pessoa"
        descricao="Cadastre uma pessoa e defina o tipo de vínculo com o condomínio."
        onClose={fecharModal}
        footer={
          <>
            <button className="primary-btn" onClick={salvar}>
              Salvar pessoa
            </button>

            <button className="secondary-btn" onClick={fecharModal}>
              Cancelar
            </button>
          </>
        }
      >
        <div className="form-grid">
          <label className="field">
            <span>Tipo de pessoa</span>
            <Dropdown
              value={form.tipo}
              onChange={(v) => {
                setForm((atual) => ({
                  ...atual,
                  tipo: v,
                  unidadeId: v === "MORADOR" ? atual.unidadeId : ""
                }));
              }}
              options={[
                { label: "Morador", value: "MORADOR" },
                { label: "Funcionário", value: "FUNCIONARIO" },
                { label: "Terceiro", value: "TERCEIRO" },
                { label: "Prestador", value: "PRESTADOR" },
                { label: "Síndico", value: "SINDICO" },
                { label: "Administrador", value: "ADMINISTRADOR" }
              ]}
            />
          </label>

          <label className="field">
            <span>Condomínio</span>
            <Dropdown
              searchable
              placeholder="Condomínio"
              value={form.condominioId}
              onChange={trocarCondominio}
              options={condominios.map((c) => ({
                label: c.nome,
                value: String(c.id)
              }))}
            />
          </label>

          {isMorador && (
            <label className="field">
              <span>Unidade / Apartamento</span>
              <Dropdown
                searchable
                placeholder="Unidade"
                value={form.unidadeId}
                onChange={(v) => atualizar("unidadeId", v)}
                options={unidades.map((u) => ({
                  label: `${u.bloco || ""} ${u.identificacao}`.trim(),
                  value: String(u.id)
                }))}
              />
            </label>
          )}

          <label className="field">
            <span>Nome completo</span>
            <input
              placeholder="Ex: Alex Ribeiro"
              value={form.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
            />
          </label>

          <label className="field">
            <span>CPF / Documento</span>
            <input
              placeholder="Ex: 000.000.000-00"
              value={form.documento}
              onChange={(e) => atualizar("documento", e.target.value)}
            />
          </label>

          <label className="field">
            <span>RG</span>
            <input
              placeholder="Ex: 12.345.678-9"
              value={form.rg}
              onChange={(e) => atualizar("rg", e.target.value)}
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
              placeholder="Ex: pessoa@email.com"
              value={form.email}
              onChange={(e) => atualizar("email", e.target.value)}
            />
          </label>

          {(isFuncionario || isTerceiro) && (
            <label className="field">
              <span>Função / Serviço</span>
              <input
                placeholder="Ex: Porteiro, Zelador, Eletricista"
                value={form.funcao}
                onChange={(e) => atualizar("funcao", e.target.value)}
              />
            </label>
          )}

          {isTerceiro && (
            <>
              <label className="field">
                <span>Validade inicial</span>
                <input
                  type="date"
                  value={form.validadeInicio}
                  onChange={(e) => atualizar("validadeInicio", e.target.value)}
                />
              </label>

              <label className="field">
                <span>Validade final</span>
                <input
                  type="date"
                  value={form.validadeFim}
                  onChange={(e) => atualizar("validadeFim", e.target.value)}
                />
              </label>
            </>
          )}

          <label className="field field-full">
            <span>Observação</span>
            <textarea
              placeholder="Observações sobre a pessoa, restrições ou informações importantes"
              value={form.observacao}
              onChange={(e) => atualizar("observacao", e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}