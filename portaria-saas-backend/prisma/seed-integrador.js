const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Criando integrador padrão...");

  const integrador = await prisma.integrador.upsert({
    where: { slug: "alx-networks" },
    update: {},
    create: {
      nome: "ALX Networks",
      slug: "alx-networks",
      ativo: true,
      tema: {
        create: {
          nomeSistema: "ALX Portaria",
          primaryColor: "#2563eb",
          primarySoftColor: "#eff6ff",
          sidebarColor: "#111827",
          bgColor: "#f5f7fb",
          cardColor: "#ffffff",
          textColor: "#172033",
          mutedColor: "#64748b",
          borderColor: "#e5e7eb"
        }
      }
    },
    include: {
      tema: true
    }
  });

  console.log("Vinculando condomínios existentes...");

  await prisma.condominio.updateMany({
    where: {
      integradorId: null
    },
    data: {
      integradorId: integrador.id
    }
  });

  console.log("Seed de integrador concluído!");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
