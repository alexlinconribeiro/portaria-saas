const express = require("express");
const multer = require("multer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ storage });

function formatarTema(integrador) {
  return {
    integradorId: integrador.id,
    nomeIntegrador: integrador.nome,
    nomeSistema: integrador.tema?.nomeSistema || integrador.nome,
    logoUrl: integrador.tema?.logoUrl || null,
    faviconUrl: integrador.tema?.faviconUrl || null,
    cores: {
      primary: integrador.tema?.primaryColor || "#2563eb",
      primarySoft: integrador.tema?.primarySoftColor || "#eff6ff",
      sidebar: integrador.tema?.sidebarColor || "#111827",
      bg: integrador.tema?.bgColor || "#f5f7fb",
      card: integrador.tema?.cardColor || "#ffffff",
      text: integrador.tema?.textColor || "#172033",
      muted: integrador.tema?.mutedColor || "#64748b",
      border: integrador.tema?.borderColor || "#e5e7eb"
    }
  };
}

// TEMA PÚBLICO PADRÃO
router.get("/", async (req, res) => {
  try {
    const integrador = await prisma.integrador.findFirst({
      where: { ativo: true },
      include: { tema: true },
      orderBy: { id: "asc" }
    });

    if (!integrador) {
      return res.status(404).json({ erro: "Tema não encontrado" });
    }

    res.json(formatarTema(integrador));
  } catch (erro) {
    console.error("Erro ao carregar tema:", erro);
    res.status(500).json({ erro: "Erro ao carregar tema" });
  }
});

// BUSCAR TEMA POR INTEGRADOR
router.get(
  "/integrador/:id",
  authMiddleware,
  validarPermissao("integradores.ver"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const integrador = await prisma.integrador.findUnique({
        where: { id },
        include: { tema: true }
      });

      if (!integrador) {
        return res.status(404).json({ erro: "Integrador não encontrado" });
      }

      res.json(formatarTema(integrador));
    } catch (erro) {
      console.error("Erro ao buscar tema do integrador:", erro);
      res.status(500).json({ erro: "Erro ao buscar tema do integrador" });
    }
  }
);

// SALVAR CORES / NOME
router.put(
  "/integrador/:id",
  authMiddleware,
  validarPermissao("integradores.editar"),
  async (req, res) => {
    try {
      const integradorId = Number(req.params.id);

      const tema = await prisma.integradorTema.upsert({
        where: { integradorId },
        create: {
          integradorId,
          nomeSistema: req.body.nomeSistema || "ALX Portaria",
          primaryColor: req.body.primaryColor || "#2563eb",
          primarySoftColor: req.body.primarySoftColor || "#eff6ff",
          sidebarColor: req.body.sidebarColor || "#111827",
          bgColor: req.body.bgColor || "#f5f7fb",
          cardColor: req.body.cardColor || "#ffffff",
          textColor: req.body.textColor || "#172033",
          mutedColor: req.body.mutedColor || "#64748b",
          borderColor: req.body.borderColor || "#e5e7eb"
        },
        update: {
          nomeSistema: req.body.nomeSistema,
          primaryColor: req.body.primaryColor,
          primarySoftColor: req.body.primarySoftColor,
          sidebarColor: req.body.sidebarColor,
          bgColor: req.body.bgColor,
          cardColor: req.body.cardColor,
          textColor: req.body.textColor,
          mutedColor: req.body.mutedColor,
          borderColor: req.body.borderColor
        }
      });

      res.json(tema);
    } catch (erro) {
      console.error("Erro ao salvar tema:", erro);
      res.status(500).json({ erro: "Erro ao salvar tema" });
    }
  }
);

// UPLOAD LOGO
router.post(
  "/integrador/:id/logo",
  authMiddleware,
  validarPermissao("integradores.editar"),
  upload.single("logo"),
  async (req, res) => {
    try {
      const integradorId = Number(req.params.id);

      if (!req.file) {
        return res.status(400).json({ erro: "Arquivo não enviado" });
      }

      const logoUrl = `/uploads/${req.file.filename}`;

      const tema = await prisma.integradorTema.upsert({
        where: { integradorId },
        create: { integradorId, logoUrl },
        update: { logoUrl }
      });

      res.json(tema);
    } catch (erro) {
      console.error("Erro ao enviar logo:", erro);
      res.status(500).json({ erro: "Erro ao enviar logo" });
    }
  }
);

// UPLOAD FAVICON
router.post(
  "/integrador/:id/favicon",
  authMiddleware,
  validarPermissao("integradores.editar"),
  upload.single("favicon"),
  async (req, res) => {
    try {
      const integradorId = Number(req.params.id);

      if (!req.file) {
        return res.status(400).json({ erro: "Arquivo não enviado" });
      }

      const faviconUrl = `/uploads/${req.file.filename}`;

      const tema = await prisma.integradorTema.upsert({
        where: { integradorId },
        create: { integradorId, faviconUrl },
        update: { faviconUrl }
      });

      res.json(tema);
    } catch (erro) {
      console.error("Erro ao enviar favicon:", erro);
      res.status(500).json({ erro: "Erro ao enviar favicon" });
    }
  }
);

router.get("/usuario", authMiddleware, async (req, res) => {
  try {
    if (req.usuario.perfil === "SUPER_ADMIN") {
      const integrador = await prisma.integrador.findFirst({
        where: { ativo: true },
        include: { tema: true },
        orderBy: { id: "asc" }
      });

      if (!integrador) {
        return res.status(404).json({ erro: "Tema não encontrado" });
      }

      return res.json(formatarTema(integrador));
    }

    if (!req.usuario.condominioId) {
      return res.status(400).json({ erro: "Usuário sem condomínio vinculado" });
    }

    const condominio = await prisma.condominio.findUnique({
      where: {
        id: Number(req.usuario.condominioId)
      },
      include: {
        integrador: {
          include: {
            tema: true
          }
        }
      }
    });

    if (!condominio || !condominio.integrador) {
      return res.status(404).json({ erro: "Integrador não encontrado" });
    }

    res.json(formatarTema(condominio.integrador));
  } catch (erro) {
    console.error("Erro ao carregar tema do usuário:", erro);
    res.status(500).json({ erro: "Erro ao carregar tema do usuário" });
  }
});
module.exports = router;