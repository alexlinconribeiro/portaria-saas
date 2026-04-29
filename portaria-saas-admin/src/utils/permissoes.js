export const PERMISSOES_POR_PERFIL = {
  SUPER_ADMIN: ["*"],

  ADMIN_CONDOMINIO: [
    "dashboard.ver",
    "portaria.ver",
    "portaria.operar",
    "visitantes.ver",
    "visitantes.criar",
    "visitantes.autorizar",
    "visitantes.finalizar",
    "logs.ver",
    "usuarios.ver",
    "usuarios.criar",
    "unidades.ver",
    "unidades.criar",
    "pessoas.ver",
    "pessoas.criar",
    "credenciais.ver",
    "credenciais.criar",
    "dispositivos.ver"
  ],

  SINDICO: [
    "dashboard.ver",
    "portaria.ver",
    "visitantes.ver",
    "visitantes.criar",
    "visitantes.autorizar",
    "logs.ver",
    "unidades.ver",
    "pessoas.ver",
    "credenciais.ver"
  ],

  PORTARIA: [
  "portaria.ver",
  "portaria.operar",

  "visitantes.ver",
  "visitantes.criar",
  "visitantes.autorizar",
  "visitantes.finalizar",

  "logs.ver"
],

  TECNICO: [
    "logs.ver",
    "dispositivos.ver",
    "dispositivos.editar"
  ],

  MORADOR: [
    "visitantes.ver",
    "visitantes.criar"
  ]
};

export function temPermissao(perfil, permissao) {
  const permissoes = PERMISSOES_POR_PERFIL[perfil] || [];

  return permissoes.includes("*") || permissoes.includes(permissao);
}
