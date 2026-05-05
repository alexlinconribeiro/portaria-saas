const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const permitirPerfis = require("../middlewares/perfil.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(permitirPerfis("SUPER_ADMIN"));

// LISTAR CONFIGURAÇÕES POR INTEGRADOR
router.get("/", async (req, res) => {
  try {
    const configs = await prisma.integradorWhatsappConfig.findMany({
      include: {
        integrador: true
      },
      orderBy: {
        id: "desc"
      }
    });

    res.json(configs);
  } catch (erro) {
    console.error("Erro ao listar configurações WhatsApp:", erro);
    res.status(500).json({ erro: "Erro ao listar configurações WhatsApp" });
  }
});

// BUSCAR CONFIGURAÇÃO DE UM INTEGRADOR
router.get("/:integradorId", async (req, res) => {
  try {
    const integradorId = Number(req.params.integradorId);

    const config = await prisma.integradorWhatsappConfig.findUnique({
      where: { integradorId },
      include: {
        integrador: true
      }
    });

    if (!config) {
      return res.json(null);
    }

    res.json(config);
  } catch (erro) {
    console.error("Erro ao buscar configuração WhatsApp:", erro);
    res.status(500).json({ erro: "Erro ao buscar configuração WhatsApp" });
  }
});

// CRIAR OU ATUALIZAR CONFIGURAÇÃO
router.put("/:integradorId", async (req, res) => {
  try {
    const integradorId = Number(req.params.integradorId);

    const {
      modo,
      ativo,
      phoneNumberId,
      accessToken,
      templateEncomenda,
      templateIdioma,
      fallbackManual
    } = req.body;

    const integrador = await prisma.integrador.findUnique({
      where: { id: integradorId }
    });

    if (!integrador) {
      return res.status(404).json({ erro: "Integrador não encontrado" });
    }

    const config = await prisma.integradorWhatsappConfig.upsert({
      where: { integradorId },
      update: {
        modo: modo || "MANUAL",
        ativo: ativo ?? false,
        phoneNumberId: phoneNumberId || null,
        accessToken: accessToken || null,
        templateEncomenda: templateEncomenda || "encomenda_recebida",
        templateIdioma: templateIdioma || "pt_BR",
        fallbackManual: fallbackManual ?? true
      },
      create: {
        integradorId,
        modo: modo || "MANUAL",
        ativo: ativo ?? false,
        phoneNumberId: phoneNumberId || null,
        accessToken: accessToken || null,
        templateEncomenda: templateEncomenda || "encomenda_recebida",
        templateIdioma: templateIdioma || "pt_BR",
        fallbackManual: fallbackManual ?? true
      },
      include: {
        integrador: true
      }
    });

    res.json(config);
  } catch (erro) {
    console.error("Erro ao salvar configuração WhatsApp:", erro);
    res.status(500).json({ erro: "Erro ao salvar configuração WhatsApp" });
  }
});

// DESATIVAR CONFIGURAÇÃO
router.patch("/:integradorId/desativar", async (req, res) => {
  try {
    const integradorId = Number(req.params.integradorId);

    const config = await prisma.integradorWhatsappConfig.update({
      where: { integradorId },
      data: {
        ativo: false,
        modo: "MANUAL"
      }
    });

    res.json(config);
  } catch (erro) {
    console.error("Erro ao desativar WhatsApp:", erro);
    res.status(500).json({ erro: "Erro ao desativar WhatsApp" });
  }
});

module.exports = router;
