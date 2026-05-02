const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");
const { validarModulo } = require("../middlewares/modulo.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// LISTAR
router.get("/", async (req, res) => {
  try {
    const where = {};

    if (req.usuario.perfil !== "SUPER_ADMIN") {
      where.id = Number(req.usuario.condominioId);
    }

    const condominios = await prisma.condominio.findMany({
      where,
      include: {
        integrador: true
      },
      orderBy: { id: "desc" }
    });

    res.json(condominios);
  } catch (erro) {
    console.error("Erro ao listar condomínios:", erro);
    res.status(500).json({ erro: "Erro ao listar condomínios" });
  }
});

// CRIAR
router.post(
  "/",
  validarModulo("integradores"),
  validarPermissao("condominios.criar"),
  async (req, res) => {
    try {
      const {
        integradorId,
        nome,
        documento,
        telefone,
        email,
        responsavel,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        estado
      } = req.body;

      if (req.usuario.perfil !== "SUPER_ADMIN") {
        return res.status(403).json({ erro: "Apenas SUPER_ADMIN pode criar condomínio" });
      }

      if (!nome) {
        return res.status(400).json({ erro: "Nome é obrigatório" });
      }

      if (!integradorId) {
        return res.status(400).json({ erro: "Integrador é obrigatório" });
      }

      const condominio = await prisma.condominio.create({
        data: {
          integradorId: Number(integradorId),
          nome,
          documento: documento || null,
          telefone: telefone || null,
          email: email || null,
          responsavel: responsavel || null,
          cep: cep || null,
          endereco: endereco || null,
          numero: numero || null,
          bairro: bairro || null,
          cidade: cidade || null,
          estado: estado || null
        },
        include: {
          integrador: true
        }
      });

      const modulos = await prisma.modulo.findMany({
        where: { ativo: true }
      });

      for (const modulo of modulos) {
        await prisma.condominioModulo.upsert({
          where: {
            condominioId_moduloId: {
              condominioId: condominio.id,
              moduloId: modulo.id
            }
          },
          update: {},
          create: {
            condominioId: condominio.id,
            moduloId: modulo.id,
            ativo: false
          }
        });
      }

      res.status(201).json(condominio);
    } catch (erro) {
      console.error("Erro ao criar condomínio:", erro);
      res.status(500).json({ erro: "Erro ao criar condomínio" });
    }
  }
);

// BUSCAR POR ID
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (
      req.usuario.perfil !== "SUPER_ADMIN" &&
      id !== Number(req.usuario.condominioId)
    ) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    const condominio = await prisma.condominio.findUnique({
      where: { id },
      include: {
        integrador: true
      }
    });

    if (!condominio) {
      return res.status(404).json({ erro: "Condomínio não encontrado" });
    }

    res.json(condominio);
  } catch (erro) {
    console.error("Erro ao buscar condomínio:", erro);
    res.status(500).json({ erro: "Erro ao buscar condomínio" });
  }
});

// EDITAR
router.put(
  "/:id",
  validarPermissao("condominios.editar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        id !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const {
        integradorId,
        nome,
        documento,
        telefone,
        email,
        responsavel,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        ativo
      } = req.body;

      const existe = await prisma.condominio.findUnique({
        where: { id }
      });

      if (!existe) {
        return res.status(404).json({ erro: "Condomínio não encontrado" });
      }

      const data = {
        nome: nome ?? undefined,
        documento: documento ?? undefined,
        telefone: telefone ?? undefined,
        email: email ?? undefined,
        responsavel: responsavel ?? undefined,
        cep: cep ?? undefined,
        endereco: endereco ?? undefined,
        numero: numero ?? undefined,
        bairro: bairro ?? undefined,
        cidade: cidade ?? undefined,
        estado: estado ?? undefined
      };

      if (req.usuario.perfil === "SUPER_ADMIN") {
        data.integradorId =
          integradorId !== undefined && integradorId !== ""
            ? Number(integradorId)
            : undefined;

        data.ativo = ativo ?? undefined;
      }

      const condominio = await prisma.condominio.update({
        where: { id },
        data,
        include: {
          integrador: true
        }
      });

      res.json(condominio);
    } catch (erro) {
      console.error("Erro ao editar condomínio:", erro);
      res.status(500).json({ erro: "Erro ao editar condomínio" });
    }
  }
);

module.exports = router;