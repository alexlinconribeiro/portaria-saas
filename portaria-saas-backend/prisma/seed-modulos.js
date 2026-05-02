const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const modulos = [
    { chave: "gestao_moradores", nome: "Gestão de Moradores", ordem: 1 },
    { chave: "gestao_visitantes", nome: "Gestão de Visitantes", ordem: 2 },
    { chave: "portaria", nome: "Portaria", ordem: 3 },
    { chave: "encomendas", nome: "Encomendas", ordem: 4 },
    { chave: "dispositivos", nome: "Dispositivos", ordem: 5 },
    { chave: "relatorios", nome: "Relatórios", ordem: 6 },
    { chave: "configuracoes", nome: "Configurações", ordem: 7 },
    { chave: "ia", nome: "Inteligência Artificial", ordem: 8 },
    { chave: "guarda_volumes", nome: "Guarda-volumes", ordem: 9 },
    { chave: "integradores", nome: "Integradores", ordem: 10 }
  ];

  console.log("📦 Criando módulos...");

  for (const mod of modulos) {
    await prisma.modulo.upsert({
      where: { chave: mod.chave },
      update: {},
      create: {
        chave: mod.chave,
        nome: mod.nome,
        ordem: mod.ordem,
        ativo: true
      }
    });
  }

  console.log("🏢 Vinculando módulos aos condomínios...");

  const condominios = await prisma.condominio.findMany();

  const todosModulos = await prisma.modulo.findMany();

  for (const cond of condominios) {
    for (const mod of todosModulos) {
      await prisma.condominioModulo.upsert({
        where: {
          condominioId_moduloId: {
            condominioId: cond.id,
            moduloId: mod.id
          }
        },
        update: {},
        create: {
          condominioId: cond.id,
          moduloId: mod.id,
          ativo: true
        }
      });
    }
  }

  console.log("✅ Seed de módulos concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
