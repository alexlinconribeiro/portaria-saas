import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("http://10.0.0.104:4000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } else {
      alert("Email ou senha inválidos");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <ShieldCheck size={32} />
        </div>

        <h1>ALX Portaria</h1>
        <p>Acesse o painel administrativo da portaria inteligente.</p>

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

          <button className="primary-btn login-btn" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}