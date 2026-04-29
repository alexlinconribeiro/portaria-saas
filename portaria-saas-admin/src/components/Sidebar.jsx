import {
  LayoutDashboard,
  Building2,
  Users,
  Home,
  UserRound,
  ScanFace,
  UserCheck,
  ClipboardList,
  Cpu,
  Settings,
  ShieldCheck
} from "lucide-react";

import { usuarioTemPermissao, getPerfil } from "../utils/auth";

const menu = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permissao: "dashboard.ver"
  },
  {
    label: "Portaria",
    href: "/portaria",
    icon: ShieldCheck,
    permissao: "portaria.ver"
  },
  {
    label: "Condomínios",
    href: "/condominios",
    icon: Building2,
    permissao: "condominios.gerenciar"
  },
  {
    label: "Usuários",
    href: "/usuarios",
    icon: Users,
    permissao: "usuarios.ver"
  },
  {
    label: "Unidades / Blocos",
    href: "/unidades",
    icon: Home,
    permissao: "unidades.ver"
  },
  {
    label: "Pessoas",
    href: "/pessoas",
    icon: UserRound,
    permissao: "pessoas.ver"
  },
  {
    label: "Faciais / Tags",
    href: "/credenciais",
    icon: ScanFace,
    permissao: "credenciais.ver"
  },
  {
    label: "Visitantes",
    href: "/visitantes",
    icon: UserCheck,
    permissao: "visitantes.ver"
  },
  {
    label: "Logs de Acesso",
    href: "/logs",
    icon: ClipboardList,
    permissao: "logs.ver"
  },
  {
    label: "Dispositivos",
    href: "/dispositivos",
    icon: Cpu,
    permissao: "dispositivos.ver"
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    permissao: "configuracoes.editar"
  }
];

export default function Sidebar({ active, collapsed, onToggle, onNavigate }) {
  const perfil = getPerfil();

  const menuFiltrado = menu.filter((item) =>
    usuarioTemPermissao(item.permissao)
  );

  function handleClick() {
    if (onNavigate) onNavigate();
  }

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-icon">A</div>

        {!collapsed && (
          <div>
            <strong>ALX Portaria</strong>
            <span>{perfil || "SaaS Admin"}</span>
          </div>
        )}
      </div>

      <button type="button" className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? "→" : "←"}
      </button>

      <nav className="sidebar-nav">
        {menuFiltrado.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className={active === item.href ? "active" : ""}
              title={item.label}
            >
              <span className="menu-icon">
                <Icon size={17} />
              </span>

              {!collapsed && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <a
          href="/perfil"
          onClick={handleClick}
          className={active === "/perfil" ? "active" : ""}
          title="Perfil"
        >
          <span className="menu-icon">
            <Users size={17} />
          </span>

          {!collapsed && <span>Perfil</span>}
        </a>
      </div>
    </aside>
  );
}