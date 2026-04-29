import { useAuth } from "../contexts/AuthContext";

export default function Header({ onMenu }) {
  const { usuario, logout } = useAuth();

  function alternarTema() {
    const atual = document.documentElement.getAttribute("data-theme") || "light";
    const novo = atual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", novo);
    localStorage.setItem("tema", novo);
  }

  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" onClick={onMenu}>☰</button>
      <div>
        <h1>Portaria SaaS</h1>
        <p>Gestão de acesso, visitantes e dispositivos</p>
      </div>
      <div className="top-actions">
        <button className="btn-soft" onClick={alternarTema}>Tema</button>
        <div className="user-chip">
          <strong>{usuario?.nome}</strong>
          <small>{usuario?.perfil}</small>
        </div>
        <button className="btn-danger-soft" onClick={logout}>Sair</button>
      </div>
    </header>
  );
}
