import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await res.json();

      if (!data.token) {
        alert("Email ou senha inválidos");
        return;
      }

      // salva token
      localStorage.setItem("token", data.token);

      // pega perfil do token
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      const perfil = payload?.perfil;

      // redireciona conforme perfil
      if (perfil === "PORTARIA") {
        window.location.href = "/portaria";
      } else if (perfil === "TECNICO") {
        window.location.href = "/dispositivos";
      } else {
        // SUPER_ADMIN e ADMIN_CONDOMINIO
        window.location.href = "/dashboard";
      }

    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <ShieldCheck size={32} />
        </div>

        <h1>ALX Portaria</h1>
        <p>Acesse o sistema da portaria inteligente.</p>

        <form onSubmit={handleLogin}>
          <label className="field">
            <span>Email</span>
            <input
              placeholder="email@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <div className="password-field">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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

          <button
            className="primary-btn login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}