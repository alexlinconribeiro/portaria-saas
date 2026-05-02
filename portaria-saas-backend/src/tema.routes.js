const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// ROTA PÚBLICA (SEM AUTH)
router.get("/", async (req, res) => {
  try {
    // futuramente aqui pode vir por domínio
    const integrador = await prisma.integrador.findFirst({
      where: { ativo: true },
      include: { tema: true }
    });

    if (!integrador) {
      return res.status(404).json({ erro: "Integrador não encontrado" });
    }

    res.json({
      nomeSistema: integrador.tema?.nomeSistema || "Portaria SaaS",
      logoUrl: integrador.tema?.logoUrl || null,
      cores: {
        primary: integrador.tema?.primaryColor,
        primarySoft: integrador.tema?.primarySoftColor,
        sidebar: integrador.tema?.sidebarColor,
        bg: integrador.tema?.bgColor,
        card: integrador.tema?.cardColor,
        text: integrador.tema?.textColor,
        muted: integrador.tema?.mutedColor,
        border: integrador.tema?.borderColor
      }
    });
  } catch (erro) {
    console.error("Erro ao carregar tema:", erro);
    res.status(500).json({ erro: "Erro ao carregar tema" });
  }
});

module.exports = router;
