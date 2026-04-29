const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// LISTAR
router.get("/", async (req, res) => {
  const { condominioId, status } = req.query;

  const where = {};

  if (condominioId) {
    where.condominioId = Number(condominioId);
  }

  if (status) {
    where.status = status;
  }

  const visitas = await prisma.visita.findMany({
    where,
    include: {
      unidade: true,
      pessoaResponsavel: true,
      autorizadoPorPessoa: true,
      dispositivo: true
    },
    orderBy: { id: "desc" }
  });

  res.json(visitas);
});

// CRIAR VISITA
router.post("/", async (req, res) => {
  const {
    condominioId,
    unidadeId,
    pessoaResponsavelId,
    nomeVisitante,
    documento,
    telefone,
    motivo,
    tipo,
    dataPrevista
  } = req.body;

  if (!condominioId || !nomeVisitante) {
    return res.status(400).json({ erro: "condominioId e nomeVisitante são obrigatórios" });
  }

  const visita = await prisma.visita.create({
    data: {
      condominioId: Number(condominioId),
      unidadeId: unidadeId ? Number(unidadeId) : null,
      pessoaResponsavelId: pessoaResponsavelId ? Number(pessoaResponsavelId) : null,
      nomeVisitante,
      documento: documento || null,
      telefone: telefone || null,
      motivo: motivo || null,
      tipo: tipo || "AVULSA",
      dataPrevista: dataPrevista ? new Date(dataPrevista) : null
    }
  });

  res.status(201).json(visita);
});

// AUTORIZAR
router.patch("/:id/autorizar", async (req, res) => {
  const id = Number(req.params.id);

  const visita = await prisma.visita.update({
    where: { id },
    data: {
      status: "AUTORIZADO",
      autorizadoEm: new Date(),
      autorizadoPorId: req.usuario?.id || null,
      autorizadoPorPessoaId: req.body?.pessoaId || null
    }
  });

  res.json(visita);
});

// NEGAR
router.patch("/:id/negar", async (req, res) => {
  const id = Number(req.params.id);

  const visita = await prisma.visita.update({
    where: { id },
    data: {
      status: "NEGADO",
      negadoEm: new Date(),
      autorizadoPorId: req.usuario?.id || null,
      autorizadoPorPessoaId: req.body?.pessoaId || null
    }
  });

  res.json(visita);
});

// ENTRADA
// ENTRADA
router.patch("/:id/entrada", async (req, res) => {
  const id = Number(req.params.id);

  const visitaAtual = await prisma.visita.findUnique({
    where: { id },
    include: {
      unidade: true,
      pessoaResponsavel: true
    }
  });

  if (!visitaAtual) {
    return res.status(404).json({ erro: "Visita não encontrada" });
  }

  const visita = await prisma.visita.update({
    where: { id },
    data: {
      status: "EM_ANDAMENTO",
      entradaEm: new Date(),
      dispositivoId: req.body.dispositivoId || null
    },
    include: {
      unidade: true,
      pessoaResponsavel: true
    }
  });

  await prisma.eventoAcesso.create({
    data: {
      condominioId: visita.condominioId,
      pessoaId: visita.pessoaResponsavelId || null,
      dispositivoId: visita.dispositivoId || null,
      tipo: "VISITANTE_MANUAL",
      origem: "VISITANTES",
      nome: visita.nomeVisitante,
      unidade: visita.unidade?.identificacao || null,
      status: "AUTORIZADO"
    }
  });

  res.json(visita);
});

// SAÍDA
router.patch("/:id/saida", async (req, res) => {
  const id = Number(req.params.id);

  const visita = await prisma.visita.update({
    where: { id },
    data: {
      status: "FINALIZADO",
      saidaEm: new Date()
    }
  });

  res.json(visita);
});

// CANCELAR
router.patch("/:id/cancelar", async (req, res) => {
  const id = Number(req.params.id);

  const visita = await prisma.visita.update({
    where: { id },
    data: {
      status: "CANCELADO",
      canceladoEm: new Date()
    }
  });

  res.json(visita);
});

module.exports = router;