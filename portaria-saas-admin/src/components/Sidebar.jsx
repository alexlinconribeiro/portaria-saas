import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  ClipboardList,
  Users,
  Home,
  UserRound,
  Cpu,
  ScanFace,
  Settings,
  Building2,
  Boxes,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { PlugZap } from "lucide-react";
import { usuarioTemPermissao, temModulo, getPerfil } from "../utils/auth";
import { getTemaSistema } from "../utils/themeLoader";

const gruposMenu = [
  {
    titulo: "Operação",
    icon: ShieldCheck,
    itens: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permissao: "portaria.ver",
        modulo: "portaria"
      },
      {
        label: "Portaria",
        href: "/portaria",
        icon: ShieldCheck,
        permissao: "portaria.ver",
        modulo: "portaria"
      },
      {
        label: "Visitantes",
        href: "/visitantes",
        icon: UserCheck,
        permissao: "visitantes.ver",
        modulo: "gestao_visitantes"
      },
	  {
		label: "Encomendas",
		href: "/encomendas",
		icon: Boxes,
		permissao: "encomendas.ver",
		modulo: "encomendas"
	},
      {
        label: "Logs de Acesso",
        href: "/logs",
        icon: ClipboardList,
        permissao: "portaria.visualizar_logs",
        modulo: "portaria"
      }
    ]
  },
  {
    titulo: "Gestão",
    icon: Users,
    itens: [
      {
        label: "Pessoas",
        href: "/pessoas",
        icon: UserRound,
        permissao: "moradores.ver",
        modulo: "gestao_moradores"
      },
      {
        label: "Unidades / Blocos",
        href: "/unidades",
        icon: Home,
        permissao: "unidades.ver",
        modulo: "gestao_moradores"
      },
      {
        label: "Usuários",
        href: "/usuarios",
        icon: Users,
        permissao: "usuarios.ver",
        modulo: "configuracoes"
      }
    ]
  },
  {
    titulo: "Controle",
    icon: Cpu,
    itens: [
      {
        label: "Dispositivos",
        href: "/dispositivos",
        icon: Cpu,
        permissao: "dispositivos.ver",
        modulo: "dispositivos"
      },
      {
        label: "Faciais / Tags",
        href: "/credenciais",
        icon: ScanFace,
        permissao: "dispositivos.ver",
        modulo: "dispositivos"
      }
    ]
  },
  {
    titulo: "Administração SaaS",
    icon: Building2,
    perfis: ["SUPER_ADMIN"],
    itens: [
      {
        label: "Condomínios",
        href: "/condominios",
        icon: Building2,
        permissao: "condominios.ver",
        modulo: "integradores"
      },
      {
        label: "Módulos",
        href: "/modulos",
        icon: Boxes,
        permissao: "configuracoes.ver",
        modulo: "configuracoes"
      },
	  {
  label: "Integradores",
  href: "/integradores",
  icon: Building2,
  permissao: "integradores.ver",
  modulo: "integradores"
},
    ]
  },
  {
    titulo: "Sistema",
    icon: Settings,
    itens: [
      {
        label: "Configurações",
        href: "/configuracoes",
        icon: Settings,
        permissao: "configuracoes.ver",
        modulo: "configuracoes"
      },
	  {
		label: "Integrações",
		href: "/integracoes",
		icon: PlugZap,
		perfil: "SUPER_ADMIN"
	  }
    ]
  }
];

function itemPermitido(item, perfil) {
  if (item.perfis && !item.perfis.includes(perfil)) return false;

  const moduloOk = item.modulo ? temModulo(item.modulo) : true;
  const permissaoOk = item.permissao
    ? usuarioTemPermissao(item.permissao)
    : true;

  return moduloOk && permissaoOk;
}

export default function Sidebar({ active, collapsed, onToggle, onNavigate }) {
  const perfil = getPerfil();

  const tema = getTemaSistema();
  const nomeSistema = tema?.nomeSistema || "ALX Portaria";
  const logoUrl = tema?.logoUrl;

  const [grupoAberto, setGrupoAberto] = useState(null);

  const gruposFiltrados = gruposMenu
    .map((grupo) => {
      if (grupo.perfis && !grupo.perfis.includes(perfil)) {
        return null;
      }

      const itens = grupo.itens.filter((item) => itemPermitido(item, perfil));

      if (itens.length === 0) return null;

      return {
        ...grupo,
        itens
      };
    })
    .filter(Boolean);

  useEffect(() => {
    if (collapsed) return;

    const grupoAtual = gruposFiltrados.find((grupo) =>
      grupo.itens.some((item) => item.href === active)
    );

    setGrupoAberto(grupoAtual?.titulo || null);
  }, [active, collapsed]);

  function alternarGrupo(titulo) {
    if (collapsed) return;

    setGrupoAberto((atual) => (atual === titulo ? null : titulo));
  }

  function handleClick() {
    if (onNavigate) onNavigate();
  }

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-icon">
          {logoUrl ? <img src={logoUrl} alt={nomeSistema} /> : "A"}
        </div>

        {!collapsed && (
          <div>
            <strong>{nomeSistema}</strong>
            <span>{perfil || "SaaS Admin"}</span>
          </div>
        )}
      </div>

      <button type="button" className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? "→" : "←"}
      </button>

      <nav className="sidebar-nav sidebar-nav-grouped">
        {gruposFiltrados.map((grupo) => {
          const GrupoIcon = grupo.icon;
          const aberto = grupoAberto === grupo.titulo;

          return (
            <div className="sidebar-group" key={grupo.titulo}>
              <button
                type="button"
                className="sidebar-group-title"
                onClick={() => alternarGrupo(grupo.titulo)}
                title={grupo.titulo}
              >
                <span className="menu-icon">
                  <GrupoIcon size={16} />
                </span>

                {!collapsed && (
                  <>
                    <span>{grupo.titulo}</span>
                    {aberto ? (
                      <ChevronDown size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )}
                  </>
                )}
              </button>

              {aberto && !collapsed && (
                <div className="sidebar-group-items">
                  {grupo.itens.map((item) => {
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

                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
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