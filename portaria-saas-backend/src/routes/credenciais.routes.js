const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const permitirPerfis = require("../middlewares/perfil.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const { condominioId, pessoaId } = req.query;

  const where = {};

  if (condominioId) where.condominioId = Number(condominioId);
  if (pessoaId) where.pessoaId = Number(pessoaId);

  const credenciais = await prisma.credencialAcesso.findMany({
    where,
    include: {
      pessoa: true
    },
    orderBy: { id: "desc" }
  });

  res.json(credenciais);
});

router.post("/", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"), async (req, res) => {
  const { pessoaId, tipo, identificador } = req.body;

  if (!pessoaId || !tipo || !identificador) {
    return res.status(400).json({ erro: "pessoaId, tipo e identificador são obrigatórios" });
  }

  const pessoa = await prisma.pessoa.findUnique({
    where: { id: Number(pessoaId) }
  });

  if (!pessoa) {
    return res.status(404).json({ erro: "Pessoa não encontrada" });
  }

  const existe = await prisma.credencialAcesso.findFirst({
    where: {
      condominioId: pessoa.condominioId,
      tipo,
      identificador
    }
  });

  if (existe) {
    return res.status(400).json({ erro: "Credencial já cadastrada" });
  }

  const credencial = await prisma.credencialAcesso.create({
    data: {
      condominioId: pessoa.condominioId,
      pessoaId: pessoa.id,
      tipo,
      identificador
    },
    include: {
      pessoa: true
    }
  });

  res.status(201).json(credencial);
});

router.put("/:id/desativar", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"), async (req, res) => {
  const id = Number(req.params.id);

  const credencial = await prisma.credencialAcesso.update({
    where: { id },
    data: { ativo: false }
  });

  res.json(credencial);
});

module.exports = router;