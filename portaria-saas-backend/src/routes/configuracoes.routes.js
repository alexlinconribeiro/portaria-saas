const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const condominioId = Number(req.query.condominioId || 1);

  let configuracao = await prisma.configuracao.findUnique({
    where: { condominioId }
  });

  if (!configuracao) {
    configuracao = await prisma.configuracao.create({
      data: { condominioId }
    });
  }

  res.json(configuracao);
});

router.put("/", async (req, res) => {
  const condominioId = Number(req.body.condominioId || 1);

  const configuracao = await prisma.configuracao.upsert({
    where: { condominioId },
    create: {
      condominioId,
      ...req.body
    },
    update: {
      tempoMaximoPermanenciaHoras: req.body.tempoMaximoPermanenciaHoras,
      permitirEntradaSemAutorizacao: req.body.permitirEntradaSemAutorizacao,
      exigirUnidade: req.body.exigirUnidade,
      exigirMoradorResponsavel: req.body.exigirMoradorResponsavel,
      abrirPortaoAutomaticamente: req.body.abrirPortaoAutomaticamente,
      registrarEntradaAutomaticamente: req.body.registrarEntradaAutomaticamente,
      exigirConfirmacaoPorteiro: req.body.exigirConfirmacaoPorteiro,
      permitirEntradaDireta: req.body.permitirEntradaDireta,
      tipoAcionamentoPortao: req.body.tipoAcionamentoPortao,
      ipDispositivoPortao: req.body.ipDispositivoPortao || null,
      portaDispositivoPortao: req.body.portaDispositivoPortao || null,
      tempoAberturaSegundos: req.body.tempoAberturaSegundos
    }
  });

  res.json(configuracao);
});

module.exports = router;
