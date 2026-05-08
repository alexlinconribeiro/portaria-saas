const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const authMiddleware = require("../middlewares/auth.middleware");

/**
 * Middleware de autenticação
 */
router.use(authMiddleware);

/**
 * GET configuração por integrador
 */
router.get("/:integradorId", async (req, res) => {
  try {
    const integradorId = Number(req.params.integradorId);

    if (!integradorId) {
      return res.status(400).json({
        erro: "Integrador inválido"
      });
    }

    const config = await prisma.integradorWhatsappConfig.findUnique({
      where: {
        integradorId
      }
    });

    return res.json(config || null);
  } catch (erro) {
    console.error("Erro ao buscar configuração WhatsApp:", erro);

    return res.status(500).json({
      erro: "Erro ao buscar configuração"
    });
  }
});

/**
 * CREATE / UPDATE configuração
 */
router.put("/:integradorId", async (req, res) => {
  try {
    const integradorId = Number(req.params.integradorId);

    if (!integradorId) {
      return res.status(400).json({
        erro: "Integrador inválido"
      });
    }

    const {
      modo,
      ativo,
      phoneNumberId,
      accessToken,
      templateEncomenda,
      templateVisitante,
      templateAcesso,
      templateIdioma,
      fallbackManual
    } = req.body;

    const existente = await prisma.integradorWhatsappConfig.findUnique({
      where: {
        integradorId
      }
    });

    let config;

    if (existente) {
      config = await prisma.integradorWhatsappConfig.update({
        where: {
          integradorId
        },
        data: {
          modo: modo || "MANUAL",
          ativo: ativo ?? false,

          phoneNumberId: phoneNumberId || null,
          accessToken: accessToken || null,

          templateEncomenda:
            templateEncomenda || "encomenda_recebida",

          templateVisitante:
            templateVisitante || "visitante_aguardando",

          templateAcesso:
            templateAcesso || "acesso_liberado",

          templateIdioma:
            templateIdioma || "pt_BR",

          fallbackManual:
            fallbackManual ?? true
        }
      });
    } else {
      config = await prisma.integradorWhatsappConfig.create({
        data: {
          integradorId,

          modo: modo || "MANUAL",
          ativo: ativo ?? false,

          phoneNumberId: phoneNumberId || null,
          accessToken: accessToken || null,

          templateEncomenda:
            templateEncomenda || "encomenda_recebida",

          templateVisitante:
            templateVisitante || "visitante_aguardando",

          templateAcesso:
            templateAcesso || "acesso_liberado",

          templateIdioma:
            templateIdioma || "pt_BR",

          fallbackManual:
            fallbackManual ?? true
        }
      });
    }

    return res.json({
      sucesso: true,
      config
    });
  } catch (erro) {
    console.error("Erro ao salvar configuração WhatsApp:", erro);

    return res.status(500).json({
      erro: "Erro ao salvar configuração"
    });
  }
});

/**
 * Desativar integração
 */
router.patch("/:integradorId/desativar", async (req, res) => {
  try {
    const integradorId = Number(req.params.integradorId);

    if (!integradorId) {
      return res.status(400).json({
        erro: "Integrador inválido"
      });
    }

    const config = await prisma.integradorWhatsappConfig.upsert({
      where: {
        integradorId
      },
      update: {
        ativo: false,
        modo: "MANUAL"
      },
      create: {
        integradorId,
        ativo: false,
        modo: "MANUAL"
      }
    });

    return res.json({
      sucesso: true,
      config
    });
  } catch (erro) {
    console.error("Erro ao desativar WhatsApp:", erro);

    return res.status(500).json({
      erro: "Erro ao desativar integração"
    });
  }
});

module.exports = router;