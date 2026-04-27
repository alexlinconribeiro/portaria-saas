const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const permitirPerfis = require("../middlewares/perfil.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

function getCondominioId(req) {
  if (req.usuario.perfil === "SUPER_ADMIN") {
    return req.body.condominioId || req.query.condominioId;
  }

  return req.usuario.condominioId;
}

router.get("/", async (req, res) => {
  const condominioId = Number(getCondominioId(req));

  if (!condominioId) {
    return res.status(400).json({ erro: "condominioId é obrigatório" });
  }

  const moradores = await prisma.morador.findMany({
    where: { condominioId },
    include: {
      unidade: true,
      credenciais: true
    },
    orderBy: { id: "desc" }
  });

  res.json(moradores);
});

router.post("/", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"), async (req, res) => {
  const condominioId = Number(getCondominioId(req));
  const { unidadeId, nome, telefone, email } = req.body;

  if (!condominioId || !unidadeId || !nome) {
    return res.status(400).json({ erro: "condominioId, unidadeId e nome são obrigatórios" });
  }

  const unidade = await prisma.unidade.findUnique({
    where: { id: Number(unidadeId) }
  });

  if (!unidade || unidade.condominioId !== condominioId) {
    return res.status(400).json({ erro: "Unidade inválida para este condomínio" });
  }

  const morador = await prisma.morador.create({
    data: {
      condominioId,
      unidadeId: Number(unidadeId),
      nome,
      telefone: telefone || null,
      email: email || null
    },
    include: {
      unidade: true
    }
  });

  res.status(201).json(morador);
});

router.put("/:id", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"), async (req, res) => {
  const id = Number(req.params.id);
  const { unidadeId, nome, telefone, email, ativo } = req.body;

  const moradorAtual = await prisma.morador.findUnique({
    where: { id }
  });

  if (!moradorAtual) {
    return res.status(404).json({ erro: "Morador não encontrado" });
  }

  if (
    req.usuario.perfil !== "SUPER_ADMIN" &&
    moradorAtual.condominioId !== req.usuario.condominioId
  ) {
    return res.status(403).json({ erro: "Acesso negado" });
  }

  let unidadeFinal = moradorAtual.unidadeId;

  if (unidadeId) {
    const unidade = await prisma.unidade.findUnique({
      where: { id: Number(unidadeId) }
    });

    if (!unidade || unidade.condominioId !== moradorAtual.condominioId) {
      return res.status(400).json({ erro: "Unidade inválida" });
    }

    unidadeFinal = Number(unidadeId);
  }

  const morador = await prisma.morador.update({
    where: { id },
    data: {
      unidadeId: unidadeFinal,
      nome: nome ?? moradorAtual.nome,
      telefone: telefone ?? moradorAtual.telefone,
      email: email ?? moradorAtual.email,
      ativo: ativo ?? moradorAtual.ativo
    },
    include: {
      unidade: true
    }
  });

  res.json(morador);
});

module.exports = router;
