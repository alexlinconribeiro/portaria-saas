const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const permissoes = [
    "encomendas.ver",
    "encomendas.registrar",
    "encomendas.editar",
    "encomendas.entregar",
    "encomendas.excluir"
  ];

  for (const chave of permissoes) {
    await prisma.permissao.upsert({
      where: { chave }, // 👈 AQUI CORRIGIDO
      update: {},
      create: {
        chave,
        descricao: chave // opcional
      }
    });
  }

  console.log("Permissões de encomendas criadas");
}

main().finally(() => prisma.$disconnect());