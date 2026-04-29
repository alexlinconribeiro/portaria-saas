import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout({ title, description, active, children, action }) {
  const [collapsed, setCollapsed] = useState(() => {
  return localStorage.getItem("sidebarCollapsed") === "true";
});
  const [menuMobile, setMenuMobile] = useState(false);
function alternarSidebar() {
  const novoValor = !collapsed;
  setCollapsed(novoValor);
  localStorage.setItem("sidebarCollapsed", String(novoValor));
}
  return (
    <div className="app-layout">
      {menuMobile && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuMobile(false)}
        />
      )}

      <div className={`sidebar-mobile-wrap ${menuMobile ? "open" : ""}`}>
        <Sidebar
          active={active}
          collapsed={collapsed}
          onToggle={alternarSidebar}
        />
      </div>

      <main className={`main ${collapsed ? "main-expanded" : ""}`}>
        <div className="mobile-header">
          <button
            className="menu-btn"
            onClick={() => setMenuMobile(true)}
          >
            <Menu size={22} />
          </button>

          <span className="mobile-title">ALX Portaria</span>
        </div>

        <header className="topbar">
          <div>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>

          <div className="top-actions">
            {action}

            <button
              className="logout"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              Sair
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
