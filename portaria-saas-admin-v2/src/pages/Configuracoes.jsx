import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import { useAuth } from "../contexts/AuthContext";

export default function Configuracoes() {
  const { usuario } = useAuth();
  const [config, setConfig] = useState(null);
  useEffect(() => {
    const id = usuario?.condominioId || 1;
    apiFetch(`/configuracoes?condominioId=${id}`).then(setConfig).catch(() => {});
  }, []);
  return <><div className="page-title"><h2>Configurações</h2><p>Base para white label, módulos e regras da portaria</p></div><div className="grid cards-2"><div className="card"><h3>Configuração atual</h3><pre>{JSON.stringify(config, null, 2)}</pre></div><div className="card"><h3>Próximos campos</h3><p>Adicionar logo, cor primária, cor secundária, módulos contratados e identidade do integrador.</p></div></div></>;
}
