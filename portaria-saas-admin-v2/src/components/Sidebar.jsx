import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const menu = [
  { label: "Dashboard", path: "/dashboard", icon: "⌂", perfis: ["SUPER_ADMIN", "ADMIN_CONDOMINIO", "PORTARIA", "TECNICO", "MORADOR"] },
  { label: "Visitantes", path: "/visitantes", icon: "⇄", perfis: ["SUPER_ADMIN", "ADMIN_CONDOMINIO", "PORTARIA"] },
  { label: "Moradores", path: "/moradores", icon: "◉", perfis: ["SUPER_ADMIN", "ADMIN_CONDOMINIO"] },
  { label: "Usuários", path: "/usuarios", icon: "◎", perfis: ["SUPER_ADMIN", "ADMIN_CONDOMINIO"] },
  { label: "Dispositivos", path: "/dispositivos", icon: "▣", perfis: ["SUPER_ADMIN", "ADMIN_CONDOMINIO", "TECNICO"] },
  { label: "Configurações", path: "/configuracoes", icon: "⚙", perfis: ["SUPER_ADMIN", "ADMIN_CONDOMINIO"] },
  { label: "Perfil", path: "/perfil", icon: "☻", perfis: ["SUPER_ADMIN", "ADMIN_CONDOMINIO", "PORTARIA", "TECNICO", "MORADOR"] }
];

export default function Sidebar({ open, onClose }) {
  const { usuario } = useAuth();
  const itens = menu.filter((item) => item.perfis.includes(usuario?.perfil));

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-logo">PI</div>
        <div>
          <strong>Portaria IA</strong>
          <small>SaaS Admin</small>
        </div>
      </div>

      <nav className="menu">
        {itens.map((item) => (
          <NavLink key={item.path} to={item.path} onClick={onClose}>
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
