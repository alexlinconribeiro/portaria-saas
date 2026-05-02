const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", validarPermissao("integradores.ver"), async (req, res) => {
  try {
    const integradores = await prisma.integrador.findMany({
      include: {
        tema: true,
        _count: {
          select: {
            condominios: true
          }
        }
      },
      orderBy: { id: "desc" }
    });

    res.json(integradores);
  } catch (erro) {
    console.error("Erro ao listar integradores:", erro);
    res.status(500).json({ erro: "Erro ao listar integradores" });
  }
});

router.post("/", validarPermissao("integradores.criar"), async (req, res) => {
  try {
    const { nome, slug, dominio } = req.body;

    if (!nome || !slug) {
      return res.status(400).json({ erro: "Nome e slug são obrigatórios" });
    }

    const integrador = await prisma.integrador.create({
      data: {
        nome,
        slug,
        dominio: dominio || null,
        tema: {
          create: {
            nomeSistema: nome
          }
        }
      },
      include: {
        tema: true
      }
    });

    res.status(201).json(integrador);
  } catch (erro) {
    console.error("Erro ao criar integrador:", erro);
    res.status(500).json({ erro: "Erro ao criar integrador" });
  }
});

router.put("/:id", validarPermissao("integradores.editar"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, slug, dominio, ativo } = req.body;

    const integrador = await prisma.integrador.update({
      where: { id },
      data: {
        nome: nome ?? undefined,
        slug: slug ?? undefined,
        dominio: dominio ?? undefined,
        ativo: ativo ?? undefined
      }
    });

    res.json(integrador);
  } catch (erro) {
    console.error("Erro ao editar integrador:", erro);
    res.status(500).json({ erro: "Erro ao editar integrador" });
  }
});

module.exports = router;
