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

  const unidades = await prisma.unidade.findMany({
    where: { condominioId },
    orderBy: [
      { bloco: "asc" },
      { identificacao: "asc" }
    ]
  });

  res.json(unidades);
});

router.post("/", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"), async (req, res) => {
  const condominioId = Number(getCondominioId(req));
  const { bloco, identificacao } = req.body;

  if (!condominioId || !identificacao) {
    return res.status(400).json({ erro: "condominioId e identificacao são obrigatórios" });
  }

  const unidade = await prisma.unidade.create({
    data: {
      condominioId,
      bloco: bloco || null,
      identificacao
    }
  });

  res.status(201).json(unidade);
});

router.put("/:id", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"), async (req, res) => {
  const id = Number(req.params.id);
  const { bloco, identificacao, ativo } = req.body;

  const unidadeAtual = await prisma.unidade.findUnique({ where: { id } });

  if (!unidadeAtual) {
    return res.status(404).json({ erro: "Unidade não encontrada" });
  }

  if (
    req.usuario.perfil !== "SUPER_ADMIN" &&
    unidadeAtual.condominioId !== req.usuario.condominioId
  ) {
    return res.status(403).json({ erro: "Acesso negado" });
  }

  const unidade = await prisma.unidade.update({
    where: { id },
    data: {
      bloco: bloco ?? unidadeAtual.bloco,
      identificacao: identificacao ?? unidadeAtual.identificacao,
      ativo: ativo ?? unidadeAtual.ativo
    }
  });

  res.json(unidade);
});

module.exports = router;
