import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import Dropdown from "../components/Dropdown";
import Permissao from "../components/Permissao";
import { apiFetch } from "../services/api";
import { getUsuarioToken } from "../utils/auth";

const categorias = {
  operacao: {
    titulo: "Operação",
    descricao: "Módulos usados no dia a dia da portaria.",
    modulos: ["portaria", "gestao_visitantes", "gestao_moradores", "encomendas"]
  },
  tecnologia: {
    titulo: "Tecnologia e Integrações",
    descricao: "Recursos técnicos, dispositivos físicos e automações.",
    modulos: ["dispositivos", "ia", "guarda_volumes"]
  },
  gestao: {
    titulo: "Gestão e Administração",
    descricao: "Recursos administrativos do condomínio e da plataforma.",
    modulos: ["relatorios", "configuracoes", "integradores"]
  }
};

function categoriaDoModulo(chave) {
  for (const [key, categoria] of Object.entries(categorias)) {
    if (categoria.modulos.includes(chave)) return key;
  }

  return "outros";
}

export default function Modulos() {
  const usuario = getUsuarioToken();
  const isSuperAdmin = usuario?.perfil === "SUPER_ADMIN";

  const [condominios, setCondominios] = useState([]);
  const [condominioId, setCondominioId] = useState(
    usuario?.condominioId ? String(usuario.condominioId) : ""
  );
  const [modulos, setModulos] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function carregarCondominios() {
    if (!isSuperAdmin) return;

    try {
      const data = await apiFetch("/condominios");
      const lista = Array.isArray(data) ? data : [];

      setCondominios(lista);

      if (!condominioId && lista[0]?.id) {
        setCondominioId(String(lista[0].id));
      }
    } catch (erro) {
      console.error("Erro ao carregar condomínios:", erro);
      alert("Erro ao carregar condomínios.");
    }
  }

  async function carregarModulos(id = condominioId) {
    if (!id) return;

    try {
      setCarregando(true);
      const data = await apiFetch(`/modulos/condominio/${id}`);
      setModulos(Array.isArray(data) ? data : []);
    } catch (erro) {
      console.error("Erro ao carregar módulos:", erro);
      alert("Erro ao carregar módulos.");
    } finally {
      setCarregando(false);
    }
  }

  async function alternarModulo(vinculo) {
    try {
      const novoStatus = !vinculo.ativo;

      await apiFetch(`/modulos/condominio/${condominioId}/${vinculo.moduloId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ativo: novoStatus
        })
      });

      setModulos((atual) =>
        atual.map((item) =>
          item.id === vinculo.id ? { ...item, ativo: novoStatus } : item
        )
      );
    } catch (erro) {
      console.error("Erro ao alterar módulo:", erro);
      alert("Erro ao alterar módulo.");
    }
  }

  useEffect(() => {
    carregarCondominios();
  }, []);

  useEffect(() => {
    if (condominioId) carregarModulos(condominioId);
  }, [condominioId]);

  const modulosAgrupados = useMemo(() => {
    const grupos = {
      operacao: [],
      tecnologia: [],
      gestao: [],
      outros: []
    };

    modulos.forEach((vinculo) => {
      const chave = vinculo.modulo?.chave;
      const categoria = categoriaDoModulo(chave);
      grupos[categoria].push(vinculo);
    });

    return grupos;
  }, [modulos]);

  const totalAtivos = modulos.filter((m) => m.ativo).length;
  const totalModulos = modulos.length;

  return (
    <Layout
      title="Módulos"
      description="Ative ou desative os módulos disponíveis por condomínio."
      active="/modulos"
    >
      <section className="panel modules-header-panel">
        <div>
          <h2>Condomínio</h2>
          <p className="muted-text">
            Selecione o condomínio para controlar os módulos contratados.
          </p>
        </div>

        {isSuperAdmin ? (
          <Dropdown
            searchable
            placeholder="Selecione o condomínio"
            value={condominioId}
            onChange={(valor) => setCondominioId(valor)}
            options={condominios.map((c) => ({
              label: c.nome,
              value: String(c.id)
            }))}
          />
        ) : (
          <div className="empty">
            Módulos do condomínio vinculado ao seu usuário.
          </div>
        )}
      </section>

      <section className="modules-summary">
        <div className="summary-card">
          <span>Módulos ativos</span>
          <strong>{totalAtivos}</strong>
        </div>

        <div className="summary-card">
          <span>Total disponível</span>
          <strong>{totalModulos}</strong>
        </div>

        <div className="summary-card">
          <span>Status</span>
          <strong>{totalAtivos > 0 ? "Operacional" : "Sem módulos"}</strong>
        </div>
      </section>

      {carregando ? (
        <section className="panel">
          <div className="empty">Carregando módulos...</div>
        </section>
      ) : totalModulos === 0 ? (
        <section className="panel">
          <div className="empty">Nenhum módulo encontrado.</div>
        </section>
      ) : (
        <>
          {Object.entries(categorias).map(([key, categoria]) => {
            const lista = modulosAgrupados[key];

            if (!lista || lista.length === 0) return null;

            return (
              <section className="panel module-category-panel" key={key}>
                <div className="module-category-header">
                  <div>
                    <h2>{categoria.titulo}</h2>
                    <p className="muted-text">{categoria.descricao}</p>
                  </div>
                </div>

                <div className="module-grid">
                  {lista.map((vinculo) => (
                    <div
                      key={vinculo.id}
                      className={`module-card ${vinculo.ativo ? "active" : ""}`}
                    >
                      <div className="module-card-info">
                        <strong>{vinculo.modulo?.nome}</strong>
                        <span>{vinculo.modulo?.chave}</span>
                      </div>

                      <div className="module-card-action">
                        <span
                          className={`module-status ${
                            vinculo.ativo ? "active" : "inactive"
                          }`}
                        >
                          {vinculo.ativo ? "Ativo" : "Inativo"}
                        </span>

                        <Permissao perm="configuracoes.editar">
                          <button
                            type="button"
                            className={`ios-toggle ${
                              vinculo.ativo ? "on" : ""
                            }`}
                            onClick={() => alternarModulo(vinculo)}
                            aria-label={
                              vinculo.ativo
                                ? "Desativar módulo"
                                : "Ativar módulo"
                            }
                          >
                            <span />
                          </button>
                        </Permissao>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {modulosAgrupados.outros.length > 0 && (
            <section className="panel module-category-panel">
              <div className="module-category-header">
                <div>
                  <h2>Outros</h2>
                  <p className="muted-text">Módulos adicionais do sistema.</p>
                </div>
              </div>

              <div className="module-grid">
                {modulosAgrupados.outros.map((vinculo) => (
                  <div
                    key={vinculo.id}
                    className={`module-card ${vinculo.ativo ? "active" : ""}`}
                  >
                    <div className="module-card-info">
                      <strong>{vinculo.modulo?.nome}</strong>
                      <span>{vinculo.modulo?.chave}</span>
                    </div>

                    <div className="module-card-action">
                      <span
                        className={`module-status ${
                          vinculo.ativo ? "active" : "inactive"
                        }`}
                      >
                        {vinculo.ativo ? "Ativo" : "Inativo"}
                      </span>

                      <Permissao perm="configuracoes.editar">
                        <button
                          type="button"
                          className={`ios-toggle ${vinculo.ativo ? "on" : ""}`}
                          onClick={() => alternarModulo(vinculo)}
                        >
                          <span />
                        </button>
                      </Permissao>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </Layout>
  );
}