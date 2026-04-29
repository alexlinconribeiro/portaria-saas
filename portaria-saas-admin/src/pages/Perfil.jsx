import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiFetch } from "../services/api";
import Layout from "../components/Layout";

export default function Perfil({ tema, setTema }) {
  const [usuario, setUsuario] = useState(null);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  const [senha, setSenha] = useState({
    atual: "",
    nova: ""
  });

async function carregar() {
  const data = await apiFetch("/perfil");

  const temaLocal = localStorage.getItem("tema");

  if (temaLocal === "light") {
    data.tema = "CLARO";
    setTema("light");
  } else if (temaLocal === "dark") {
    data.tema = "ESCURO";
    setTema("dark");
  } else {
    setTema(data.tema === "CLARO" ? "light" : "dark");
  }

  setUsuario(data);
}

  function atualizar(campo, valor) {
    setUsuario((u) => ({ ...u, [campo]: valor }));
  }

  async function salvar() {
    await apiFetch("/perfil", {
      method: "PUT",
      body: JSON.stringify({
        nome: usuario.nome,
        tema: usuario.tema
      })
    });

    alert("Perfil atualizado com sucesso");
  }

  async function alterarSenha() {
    if (!senha.atual || !senha.nova) {
      alert("Preencha a senha atual e a nova senha");
      return;
    }

    await apiFetch("/perfil/senha", {
      method: "PUT",
      body: JSON.stringify({
        senhaAtual: senha.atual,
        novaSenha: senha.nova
      })
    });

    setSenha({ atual: "", nova: "" });
    alert("Senha alterada com sucesso");
  }

  useEffect(() => {
    carregar();
  }, []);

  if (!usuario) {
    return (
      <Layout title="Perfil" description="Dados do usuário" active="/perfil">
        <section className="panel">
          <div className="empty">Carregando...</div>
        </section>
      </Layout>
    );
  }

  const temaEscuro = usuario.tema === "ESCURO";

  return (
    <Layout
      title="Perfil"
      description="Gerencie seus dados e preferências"
      active="/perfil"
      action={
        <button className="primary-btn" onClick={salvar}>
          Salvar alterações
        </button>
      }
    >
      <section className="grid">
        <div className="panel">
          <h2>Dados do usuário</h2>

          <div className="form-grid">
            <label className="field">
              <span>Nome</span>
              <input
                value={usuario.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input value={usuario.email} disabled />
            </label>

            <label className="field">
              <span>Preferência de tema</span>

              <button
                type="button"
                className={`theme-switch ${temaEscuro ? "active" : ""}`}
                onClick={() => {
  const novoTemaUsuario =
    usuario.tema === "ESCURO" ? "CLARO" : "ESCURO";

  const novoTemaTela =
    novoTemaUsuario === "ESCURO" ? "dark" : "light";

  atualizar("tema", novoTemaUsuario);
  setTema(novoTemaTela);

  localStorage.setItem("tema", novoTemaTela);
}}
              >
                <span className="switch-track">
                  <span className="switch-thumb" />
                </span>

                <strong>{temaEscuro ? "Modo escuro" : "Modo claro"}</strong>
              </button>
            </label>
          </div>
        </div>

        <div className="panel">
          <h2>Alterar senha</h2>

          <div className="form-grid">
            <label className="field">
              <span>Senha atual</span>

              <div className="password-field">
                <input
                  type={mostrarSenhaAtual ? "text" : "password"}
                  value={senha.atual}
                  onChange={(e) =>
                    setSenha((s) => ({ ...s, atual: e.target.value }))
                  }
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setMostrarSenhaAtual((v) => !v)}
                >
                  {mostrarSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="field">
              <span>Nova senha</span>

              <div className="password-field">
                <input
                  type={mostrarNovaSenha ? "text" : "password"}
                  value={senha.nova}
                  onChange={(e) =>
                    setSenha((s) => ({ ...s, nova: e.target.value }))
                  }
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setMostrarNovaSenha((v) => !v)}
                >
                  {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="secondary-btn" onClick={alterarSenha}>
              Alterar senha
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}