import Permissao from "../components/Permissao";
import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Dropdown from "../components/Dropdown";
import { getUsuarioToken, usuarioTemPermissao } from "../utils/auth";

const ordemStatus = {
  PENDENTE: 1,
  AUTORIZADO: 2,
  EM_ANDAMENTO: 3,
  FINALIZADO: 4,
  NEGADO: 5,
  CANCELADO: 6
};

function criarVazio(condominioId = "1") {
  return {
    condominioId: String(condominioId || "1"),
    unidadeId: "",
    pessoaResponsavelId: "",
    nomeVisitante: "",
    documento: "",
    telefone: "",
    motivo: "",
    tipo: "AVULSA",
    dataPrevista: ""
  };
}

export default function Visitantes() {
  const usuario = getUsuarioToken();

  const podeVer = usuarioTemPermissao("visitantes.ver");
  const podeCriar = usuarioTemPermissao("visitantes.criar");
  const podeAutorizar = usuarioTemPermissao("visitantes.autorizar");
  const podeNegar = usuarioTemPermissao("visitantes.negar");
  const podeHistorico = usuarioTemPermissao("visitantes.historico");

  const isSuperAdmin = usuario?.perfil === "SUPER_ADMIN";

  const condominioPadrao = String(usuario?.condominioId || "1");

  const [visitas, setVisitas] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [pessoas, setPessoas] = useState([]);

  const [form, setForm] = useState(() => criarVazio(condominioPadrao));
  const [modal, setModal] = useState(false);

  const [condominioFiltro, setCondominioFiltro] = useState(condominioPadrao);
  const [statusFiltro, setStatusFiltro] = useState("");

  async function carregar(id = condominioFiltro, status = statusFiltro) {
    if (!podeVer) return;

    const condominioId = String(id || condominioPadrao);

    try {
      if (isSuperAdmin) {
        const conds = await apiFetch("/condominios");
        setCondominios(Array.isArray(conds) ? conds : []);
      } else {
        setCondominios([]);
      }

      const unidadesData = await apiFetch(`/unidades?condominioId=${condominioId}`);
      const pessoasData = await apiFetch(`/pessoas?condominioId=${condominioId}`);

      let url = `/visitantes?condominioId=${condominioId}`;
      if (status) url += `&status=${status}`;

      const visitasData = await apiFetch(url);

      const ordenado = (Array.isArray(visitasData) ? visitasData : []).sort(
        (a, b) => (ordemStatus[a.status] || 99) - (ordemStatus[b.status] || 99)
      );

      setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
      setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
      setVisitas(ordenado);
    } catch (erro) {
      console.error("Erro ao carregar visitantes:", erro);
      alert("Erro ao carregar visitantes.");
    }
  }

  function atualizar(campo, valor) {
    setForm((atual) => {
      const novo = { ...atual, [campo]: valor };

      if (campo === "condominioId") {
        novo.unidadeId = "";
        novo.pessoaResponsavelId = "";
      }

      if (campo === "unidadeId") {
        novo.pessoaResponsavelId = "";
      }

      return novo;
    });
  }

  function abrirNovo() {
    if (!podeCriar) return;

    setForm(criarVazio(condominioFiltro));
    setModal(true);
  }

  function fecharModal() {
    setModal(false);
    setForm(criarVazio(condominioFiltro));
  }

  async function salvar() {
    if (!podeCriar) {
      alert("Você não tem permissão para criar visitantes.");
      return;
    }

    if (!form.condominioId || !form.nomeVisitante) {
      alert("Condomínio e nome do visitante são obrigatórios");
      return;
    }

    if (!form.unidadeId) {
      alert("Informe a unidade da visita");
      return;
    }

    if (!form.pessoaResponsavelId) {
      alert("Informe o morador responsável pela visita");
      return;
    }

    const payload = {
      ...form,
      condominioId: Number(form.condominioId),
      unidadeId: Number(form.unidadeId),
      pessoaResponsavelId: Number(form.pessoaResponsavelId),
      dataPrevista: form.dataPrevista || null
    };

    try {
      await apiFetch("/visitantes", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      fecharModal();
      carregar(form.condominioId, statusFiltro);
    } catch (erro) {
      console.error("Erro ao salvar visitante:", erro);
      alert("Erro ao salvar visitante.");
    }
  }

  async function acao(id, tipo) {
    const exigeAutorizar = ["autorizar", "entrada", "saida"].includes(tipo);
    const exigeNegar = ["negar", "cancelar"].includes(tipo);

    if (exigeAutorizar && !podeAutorizar) {
      alert("Você não tem permissão para autorizar ou movimentar visitantes.");
      return;
    }

    if (exigeNegar && !podeNegar) {
      alert("Você não tem permissão para negar ou cancelar visitantes.");
      return;
    }

    try {
      await apiFetch(`/visitantes/${id}/${tipo}`, {
        method: "PATCH"
      });

      carregar(condominioFiltro, statusFiltro);
    } catch (erro) {
      console.error("Erro ao executar ação:", erro);
      alert("Erro ao executar ação.");
    }
  }

  function aplicarFiltro(status) {
    setStatusFiltro(status);
    carregar(condominioFiltro, status);
  }

  function formatarData(data) {
    return data ? new Date(data).toLocaleString("pt-BR") : "-";
  }

  function statusLabel(status) {
    if (status === "EM_ANDAMENTO") return "EM ANDAMENTO";
    return status || "-";
  }

  function unidadeDaPessoa(pessoa) {
    return pessoa.unidades?.some(
      (pu) => String(pu.unidadeId) === String(form.unidadeId)
    );
  }

  const moradoresDaUnidade = pessoas.filter(
    (p) => p.tipo === "MORADOR" && unidadeDaPessoa(p)
  );

  const visitasVisiveis = podeHistorico
    ? visitas
    : visitas.filter((v) =>
        ["PENDENTE", "AUTORIZADO", "EM_ANDAMENTO"].includes(v.status)
      );

  const emAndamento = visitasVisiveis.filter(
    (v) => v.status === "EM_ANDAMENTO"
  );

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!podeVer) {
    return (
      <Layout
        title="Visitantes"
        description="Operação de entrada, autorização e saída de visitantes."
        active="/visitantes"
      >
        <section className="panel">
          <div className="empty">
            Você não tem permissão para visualizar visitantes.
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="Visitantes"
      description="Operação de entrada, autorização e saída de visitantes."
      active="/visitantes"
      action={
        podeCriar ? (
         <Permissao perm="visitantes.criar">
			<button className="primary-btn" onClick={abrirNovo}>
				+ Novo visitante
			</button>
		</Permissao>
        ) : null
      }
    >
      <section className="panel">
        <h2>Filtro</h2>

        <div className="filters">
          {isSuperAdmin && (
            <Dropdown
              searchable
              placeholder="Condomínio"
              value={condominioFiltro}
              onChange={(val) => {
                setCondominioFiltro(val);
                setStatusFiltro("");
                carregar(val, "");
              }}
              options={condominios.map((c) => ({
                label: c.nome,
                value: String(c.id)
              }))}
            />
          )}

          <Dropdown
            placeholder="Status"
            value={statusFiltro}
            onChange={(val) => aplicarFiltro(val)}
            options={[
              { label: "Todos", value: "" },
              { label: "Pendente", value: "PENDENTE" },
              { label: "Autorizado", value: "AUTORIZADO" },
              { label: "Em andamento", value: "EM_ANDAMENTO" },
              ...(podeHistorico
                ? [
                    { label: "Negado", value: "NEGADO" },
                    { label: "Finalizado", value: "FINALIZADO" },
                    { label: "Cancelado", value: "CANCELADO" }
                  ]
                : [])
            ]}
          />
        </div>
      </section>

      <section className="panel">
        <h2>Dentro do condomínio</h2>

        {emAndamento.length === 0 ? (
          <div className="empty">
            Nenhum visitante dentro do condomínio no momento.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitante</th>
                <th>Unidade</th>
                <th>Responsável</th>
                <th>Entrada</th>
                {podeAutorizar && <th>Ação</th>}
              </tr>
            </thead>

            <tbody>
              {emAndamento.map((v) => (
                <tr key={v.id}>
                  <td>{v.nomeVisitante}</td>
                  <td>{v.unidade?.identificacao || "-"}</td>
                  <td>{v.pessoaResponsavel?.nome || "-"}</td>
                  <td>{formatarData(v.entradaEm)}</td>

                  {podeAutorizar && (
                    <td>
                    <Permissao perm="portaria.operar">
						<button className="table-btn" onClick={() => acao(v.id, "saida")}>
							Registrar saída
						</button>
					</Permissao>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel logs-panel">
        <h2>Visitantes cadastrados</h2>

        {visitasVisiveis.length === 0 ? (
          <div className="empty">Nenhuma visita cadastrada.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Visitante</th>
                <th>Unidade</th>
                <th>Responsável</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Previsto</th>
                <th>Entrada</th>
                <th>Saída</th>
                {(podeAutorizar || podeNegar) && <th>Ações</th>}
              </tr>
            </thead>

            <tbody>
              {visitasVisiveis.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span
                      className={`status-badge ${String(
                        v.status || ""
                      ).toLowerCase()}`}
                    >
                      <span
                        className={`status-dot ${String(
                          v.status || ""
                        ).toLowerCase()}`}
                      />
                      {statusLabel(v.status)}
                    </span>
                  </td>

                  <td>{v.nomeVisitante}</td>
                  <td>{v.unidade?.identificacao || "-"}</td>
                  <td>{v.pessoaResponsavel?.nome || "-"}</td>
                  <td>{v.tipo || "-"}</td>
                  <td>{v.motivo || "-"}</td>
                  <td>{formatarData(v.dataPrevista)}</td>
                  <td>{formatarData(v.entradaEm)}</td>
                  <td>{formatarData(v.saidaEm)}</td>

                  {(podeAutorizar || podeNegar) && (
                    <td>
                      {v.status === "PENDENTE" && (
                        <>
                          {podeAutorizar && (
                            <Permissao perm="visitantes.autorizar">
									<button className="table-btn" onClick={() => acao(v.id, "autorizar")}>
										Autorizar
									</button>
							</Permissao>
                          )}

                          {podeNegar && (
                            <Permissao perm="visitantes.negar">
								<button
									className="table-btn secondary-table-btn"
									onClick={() => acao(v.id, "negar")}
								>
									Negar
								</button>
								</Permissao>
                          )}
                        </>
                      )}

                      {v.status === "AUTORIZADO" && (
                        <>
                          {podeAutorizar && (
                            <button
                              className="table-btn"
                              onClick={() => acao(v.id, "entrada")}
                            >
                              Registrar entrada
                            </button>
                          )}

                          {podeNegar && (
                            <button
                              className="table-btn secondary-table-btn"
                              onClick={() => acao(v.id, "cancelar")}
                            >
                              Cancelar
                            </button>
                          )}
                        </>
                      )}

                      {v.status === "EM_ANDAMENTO" && podeAutorizar && (
                        <button
                          className="table-btn"
                          onClick={() => acao(v.id, "saida")}
                        >
                          Registrar saída
                        </button>
                      )}

                      {["FINALIZADO", "NEGADO", "CANCELADO"].includes(
                        v.status
                      ) && "-"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {podeCriar && (
        <Modal
          aberto={modal}
          titulo="Novo visitante"
          descricao="Cadastre uma visita vinculada à unidade e ao morador responsável."
          onClose={fecharModal}
          footer={
            <>
              <button className="primary-btn" onClick={salvar}>
                Salvar visitante
              </button>

              <button className="secondary-btn" onClick={fecharModal}>
                Cancelar
              </button>
            </>
          }
        >
          <div className="form-grid">
            {isSuperAdmin && (
              <label className="field">
                <span>Condomínio</span>
                <Dropdown
                  searchable
                  placeholder="Condomínio"
                  value={form.condominioId}
                  onChange={(v) => atualizar("condominioId", v)}
                  options={condominios.map((c) => ({
                    label: c.nome,
                    value: String(c.id)
                  }))}
                />
              </label>
            )}

            <label className="field">
              <span>Unidade</span>
              <Dropdown
                searchable
                placeholder="Selecione a unidade"
                value={form.unidadeId}
                onChange={(v) => atualizar("unidadeId", v)}
                options={unidades.map((u) => ({
                  label: `${u.bloco ? `${u.bloco} - ` : ""}${u.identificacao}`,
                  value: String(u.id)
                }))}
              />
            </label>

            <label className="field">
              <span>Morador responsável</span>
              <Dropdown
                searchable
                placeholder={
                  form.unidadeId
                    ? "Selecione o morador"
                    : "Selecione a unidade primeiro"
                }
                value={form.pessoaResponsavelId}
                onChange={(v) => atualizar("pessoaResponsavelId", v)}
                options={moradoresDaUnidade.map((p) => ({
                  label: p.nome,
                  value: String(p.id)
                }))}
              />
            </label>

            <label className="field">
              <span>Nome do visitante</span>
              <input
                placeholder="Ex: João da Silva"
                value={form.nomeVisitante}
                onChange={(e) => atualizar("nomeVisitante", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Documento</span>
              <input
                placeholder="CPF ou RG"
                value={form.documento}
                onChange={(e) => atualizar("documento", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Telefone</span>
              <input
                placeholder="Telefone"
                value={form.telefone}
                onChange={(e) => atualizar("telefone", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Tipo</span>
              <Dropdown
                value={form.tipo}
                onChange={(v) => atualizar("tipo", v)}
                options={[
                  { label: "Avulsa", value: "AVULSA" },
                  { label: "Agendada", value: "AGENDADA" },
                  { label: "Prestador", value: "PRESTADOR" },
                  { label: "Entrega", value: "ENTREGA" }
                ]}
              />
            </label>

            <label className="field">
              <span>Data prevista</span>
              <input
                type="datetime-local"
                value={form.dataPrevista}
                onChange={(e) => atualizar("dataPrevista", e.target.value)}
              />
            </label>

            <label className="field field-full">
              <span>Motivo</span>
              <input
                placeholder="Ex: Visita familiar, entrega, manutenção"
                value={form.motivo}
                onChange={(e) => atualizar("motivo", e.target.value)}
              />
            </label>
          </div>
        </Modal>
      )}
    </Layout>
  );
}