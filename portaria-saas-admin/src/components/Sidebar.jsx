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
  Settings
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Condomínios", href: "/condominios", icon: Building2 },
  { label: "Usuários", href: "/usuarios", icon: Users },
  { label: "Unidades / Blocos", href: "/unidades", icon: Home },
  { label: "Pessoas", href: "/pessoas", icon: UserRound },
  { label: "Faciais / Tags", href: "/credenciais", icon: ScanFace },
  { label: "Visitantes", href: "/visitantes", icon: UserCheck },
  { label: "Logs de Acesso", href: "/logs", icon: ClipboardList },
  { label: "Dispositivos", href: "/dispositivos", icon: Cpu },
  { label: "Configurações", href: "/configuracoes", icon: Settings }
];

export default function Sidebar({ active, collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-icon">A</div>

        {!collapsed && (
          <div>
            <strong>ALX Portaria</strong>
            <span>SaaS Admin</span>
          </div>
        )}
      </div>

      <button className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? "→" : "←"}
      </button>

      <nav>
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
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
    </aside>
  );
}