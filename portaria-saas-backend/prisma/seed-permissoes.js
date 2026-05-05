const { PrismaClient, PerfilUsuario } = require("@prisma/client");

const prisma = new PrismaClient();

const permissoes = [
  "moradores.ver",
  "moradores.criar",
  "moradores.editar",
  "moradores.excluir",

  "visitantes.ver",
  "visitantes.criar",
  "visitantes.autorizar",
  "visitantes.negar",
  "visitantes.historico",

  "portaria.ver",
  "portaria.operar",
  "portaria.abrir_portao",
  "portaria.visualizar_logs",

  "encomendas.ver",
  "encomendas.registrar",
  "encomendas.editar",
  "encomendas.excluir",
  "encomendas.notificar_morador",
  "encomendas.entregar",
  "encomendas.historico",

  "dispositivos.ver",
  "dispositivos.criar",
  "dispositivos.editar",
  "dispositivos.excluir",

  "relatorios.ver",
  "relatorios.exportar",

  "configuracoes.ver",
  "configuracoes.editar",

  "ia.ver",
  "ia.configurar",
  "ia.ativar",
  "ia.desativar",
  "ia.logs",

  "guarda_volumes.ver",
  "guarda_volumes.configurar",
  "guarda_volumes.abrir_compartimento",
  "guarda_volumes.vincular_encomenda",
  "guarda_volumes.liberar_retirada",
  "guarda_volumes.historico",

  "integradores.ver",
  "integradores.criar",
  "integradores.editar",
  "integradores.excluir",
  "integradores.configurar_tema",

  "condominios.ver",
  "condominios.criar",
  "condominios.editar",
  "condominios.excluir",

  "usuarios.ver",
  "usuarios.criar",
  "usuarios.editar",
  "usuarios.excluir",

  "unidades.ver",
  "unidades.criar",
  "unidades.editar",
  "unidades.excluir",
  
  
  "whatsapp_config.ver",
 "whatsapp_config.editar",
];

const permissoesPorPerfil = {
  SUPER_ADMIN: permissoes,

	  ADMIN_CONDOMINIO: [
		"moradores.ver",
		"moradores.criar",
		"moradores.editar",
		"moradores.excluir",

		"visitantes.ver",
		"visitantes.criar",
		"visitantes.autorizar",
		"visitantes.negar",
		"visitantes.historico",

		"portaria.ver",
		"portaria.visualizar_logs",

		"encomendas.ver",
		"encomendas.registrar",
		"encomendas.editar",
		"encomendas.excluir",
		"encomendas.notificar_morador",
		"encomendas.entregar",
		"encomendas.historico",

		"dispositivos.ver",

		"relatorios.ver",
		"relatorios.exportar",

		"configuracoes.ver",
		"configuracoes.editar",

		"usuarios.ver",
		"usuarios.criar",
		"usuarios.editar",
		"usuarios.excluir",

		"unidades.ver",
		"unidades.criar",
		"unidades.editar",
		"unidades.excluir"
	  ],

  PORTARIA: [
    "visitantes.ver",
    "visitantes.criar",
    "visitantes.autorizar",
    "visitantes.negar",

    "portaria.ver",
    "portaria.operar",
    "portaria.abrir_portao",

    "encomendas.ver",
    "encomendas.registrar",
    "encomendas.notificar_morador",
    "encomendas.entregar",

    "moradores.ver",
    "unidades.ver"
  ],

  TECNICO: [
    "dispositivos.ver",
    "dispositivos.criar",
    "dispositivos.editar",
    "dispositivos.excluir",

    "ia.ver",
    "ia.configurar",

    "guarda_volumes.ver",
    "guarda_volumes.configurar",
    "guarda_volumes.abrir_compartimento"
  ],

  MORADOR: [
    "moradores.ver",
    "visitantes.historico",
    "encomendas.ver",
    "encomendas.historico"
  ]
};

async function main() {
  for (const chave of permissoes) {
    await prisma.permissao.upsert({
      where: { chave },
      update: {},
      create: { chave }
    });
  }

  for (const [perfil, listaPermissoes] of Object.entries(permissoesPorPerfil)) {
    for (const chave of listaPermissoes) {
      const permissao = await prisma.permissao.findUnique({
        where: { chave }
      });

      if (!permissao) continue;

      await prisma.perfilPermissao.upsert({
        where: {
          perfil_permissaoId: {
            perfil,
            permissaoId: permissao.id
          }
        },
        update: {},
        create: {
          perfil,
          permissaoId: permissao.id
        }
      });
    }
  }

  console.log("Permissões criadas com sucesso.");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
