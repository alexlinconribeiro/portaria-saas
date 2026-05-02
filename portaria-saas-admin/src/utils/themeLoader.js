export async function carregarTema() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(token ? "/api/tema/usuario" : "/api/tema", {
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    });

    const data = await res.json();

    if (!data) return;

    localStorage.setItem("temaSistema", JSON.stringify(data));

    const root = document.documentElement;

    if (data?.cores?.primary) {
      root.style.setProperty("--primary", data.cores.primary);
    }

    if (data?.cores?.primarySoft) {
      root.style.setProperty("--primary-soft", data.cores.primarySoft);
    }

    if (data?.cores?.sidebar) {
      root.style.setProperty("--sidebar", data.cores.sidebar);
      root.style.setProperty("--sidebar-bg", data.cores.sidebar);
    }

    if (data.nomeSistema) {
      document.title = data.nomeSistema;
    }

    if (data.faviconUrl) {
      let favicon = document.querySelector("link[rel='icon']");

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      favicon.href = data.faviconUrl;
    }
  } catch (err) {
    console.error("Erro ao carregar tema:", err);
  }
}

export function getTemaSistema() {
  try {
    return JSON.parse(localStorage.getItem("temaSistema"));
  } catch {
    return null;
  }
}