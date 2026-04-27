const { PrismaClient, PerfilUsuario } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@portaria.com" },
    update: {},
    create: {
      nome: "Super Admin",
      email: "admin@portaria.com",
      senhaHash,
      perfil: PerfilUsuario.SUPER_ADMIN,
      ativo: true
    }
  });

  console.log("Admin criado:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
