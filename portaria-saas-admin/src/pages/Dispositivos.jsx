import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Dropdown from "../components/Dropdown";

const vazio = {
  nome: "",
  tipo: "LEITOR_FACIAL",
  fabricante: "INTELBRAS",
  modelo: "",
  ip: "",
  porta: "80",
  localizacao: "",
  condominioId: "1"
};

export default function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [form, setForm] = useState(vazio);
  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [condominioFiltro, setCondominioFiltro] = useState("1");
  const [testandoTodos, setTestandoTodos] = useState(false);

  async function carregar(id = condominioFiltro) {
    const conds = await apiFetch("/condominios");
    setCondominios(Array.isArray(conds) ? conds : []);

    const data = await apiFetch(`/dispositivos?condominioId=${id}`);
    setDispositivos(Array.isArray(data) ? data : []);
  }

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function abrirNovo() {
    setEditandoId(null);
    setForm({ ...vazio, condominioId: condominioFiltro });
    setModal(true);
  }

  function editar(d) {
    setEditandoId(d.id);
    setForm({
      nome: d.nome || "",
      tipo: d.tipo || "LEITOR_FACIAL",
      fabricante: d.fabricante || "INTELBRAS",
      modelo: d.modelo || "",
      ip: d.ip || "",
      porta: String(d.porta || 80),
      localizacao: d.localizacao || "",
      condominioId: String(d.condominioId || condominioFiltro)
    });
    setModal(true);
  }

  function fecharModal() {
    setModal(false);
    setEditandoId(null);
    setForm(vazio);
  }

  async function salvar() {
    if (!form.nome || !form.fabricante || !form.modelo || !form.ip) {
      alert("Nome, fabricante, modelo e IP são obrigatórios");
      return;
    }

    const payload = {
      ...form,
      porta: Number(form.porta || 80),
      condominioId: Number(form.condominioId)
    };

    if (editandoId) {
      await apiFetch(`/dispositivos/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await apiFetch("/dispositivos", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }

    fecharModal();
    carregar(form.condominioId);
  }

  async function testar(id) {
    await apiFetch(`/dispositivos/${id}/check`, {
      method: "POST"
    });

    carregar(condominioFiltro);
  }

  async function testarTodos() {
    setTestandoTodos(true);

    for (const d of dispositivos) {
      await apiFetch(`/dispositivos/${d.id}/check`, {
        method: "POST"
      });
    }

    await carregar(condominioFiltro);
    setTestandoTodos(false);
  }

  function statusLabel(status) {
    if (status === "ONLINE") return "ONLINE";
    if (status === "OFFLINE") return "OFFLINE";
    return "DESCONHECIDO";
  }

  function modelosPorFabricante() {
    if (form.fabricante === "HIKVISION") {
      return [{ label: "DS-K1T673", value: "DS-K1T673" }];
    }

    return [
      { label: "SS 3530 MF FACE", value: "SS 3530 MF FACE" },
      { label: "SS 3530 MF FACE W", value: "SS 3530 MF FACE W" },
      { label: "SS 3540 MF FACE EX", value: "SS 3540 MF FACE EX" },
      { label: "SS 7530 FACE", value: "SS 7530 FACE" }
    ];
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Layout
      title="Dispositivos"
      description="Gerencie leitores faciais, controladoras e equipamentos da portaria."
      active="/dispositivos"
      action={
        <button className="primary-btn" onClick={abrirNovo}>
          + Adicionar dispositivo
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

          <button onClick={testarTodos} disabled={testandoTodos || dispositivos.length === 0}>
            {testandoTodos ? "Testando..." : "Testar todos"}
          </button>
        </div>
      </section>

      <section className="panel logs-panel">
        <h2>Dispositivos cadastrados</h2>

        {dispositivos.length === 0 ? (
          <div className="empty">Nenhum dispositivo cadastrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Nome</th>
                <th>Fabricante</th>
                <th>Modelo</th>
                <th>IP:Porta</th>
                <th>Local</th>
                <th>Último check</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {dispositivos.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className={`status-badge ${d.status?.toLowerCase() || "desconhecido"}`}>
                      <span className={`status-dot ${d.status?.toLowerCase() || "desconhecido"}`} />
                      {statusLabel(d.status)}
                    </span>
                  </td>

                  <td>{d.nome}</td>
                  <td>{d.fabricante || "-"}</td>
                  <td>{d.modelo || "-"}</td>
                  <td>{d.ip ? `${d.ip}:${d.porta || 80}` : "-"}</td>
                  <td>{d.localizacao || "-"}</td>
                  <td>
                    {d.ultimoCheck
                      ? new Date(d.ultimoCheck).toLocaleString("pt-BR")
                      : "-"}
                  </td>

                  <td>
                    <button className="table-btn" onClick={() => testar(d.id)}>
                      Testar
                    </button>

                    <button
                      className="table-btn secondary-table-btn"
                      onClick={() => editar(d)}
                    >
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
        aberto={modal}
        titulo={editandoId ? "Editar dispositivo" : "Novo dispositivo"}
        descricao="Cadastre leitores faciais e equipamentos da portaria."
        onClose={fecharModal}
        footer={
          <>
            <button className="primary-btn" onClick={salvar}>
              {editandoId ? "Salvar alterações" : "Salvar dispositivo"}
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
              onChange={(v) => atualizar("condominioId", v)}
              options={condominios.map((c) => ({
                label: c.nome,
                value: String(c.id)
              }))}
            />
          </label>

          <label className="field">
            <span>Nome do dispositivo</span>
            <input
              placeholder="Ex: Leitor Portaria"
              value={form.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Fabricante</span>
            <Dropdown
              value={form.fabricante}
              onChange={(v) => {
                atualizar("fabricante", v);
                atualizar("modelo", "");
              }}
              options={[
                { label: "Intelbras", value: "INTELBRAS" },
                { label: "Hikvision", value: "HIKVISION" }
              ]}
            />
          </label>

          <label className="field">
            <span>Modelo</span>
            <Dropdown
              placeholder="Selecione o modelo"
              value={form.modelo}
              onChange={(v) => atualizar("modelo", v)}
              options={modelosPorFabricante()}
            />
          </label>

          <label className="field">
            <span>Tipo</span>
            <Dropdown
              value={form.tipo}
              onChange={(v) => atualizar("tipo", v)}
              options={[
                { label: "Leitor facial", value: "LEITOR_FACIAL" },
                { label: "Controladora", value: "CONTROLADORA" },
                { label: "Portão", value: "PORTAO" },
                { label: "Cancela", value: "CANCELA" },
                { label: "Interfone", value: "INTERFONE" },
                { label: "PBX", value: "PBX" },
                { label: "Câmera", value: "CAMERA" },
                { label: "Outro", value: "OUTRO" }
              ]}
            />
          </label>

          <label className="field">
            <span>IP do equipamento</span>
            <input
              placeholder="Ex: 192.168.1.50"
              value={form.ip}
              onChange={(e) => atualizar("ip", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Porta</span>
            <input
              placeholder="Ex: 80"
              value={form.porta}
              onChange={(e) => atualizar("porta", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Localização</span>
            <input
              placeholder="Ex: Portaria principal"
              value={form.localizacao}
              onChange={(e) => atualizar("localizacao", e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </Layout>
  );
}