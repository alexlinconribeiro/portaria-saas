const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get(
  "/",
  validarPermissao("configuracoes.ver"),
  async (req, res) => {
    try {
      const modulos = await prisma.modulo.findMany({
        orderBy: { ordem: "asc" }
      });

      res.json(modulos);
    } catch (erro) {
      console.error("Erro ao listar módulos:", erro);
      res.status(500).json({ erro: "Erro ao listar módulos" });
    }
  }
);

router.get(
  "/condominio/:condominioId",
  validarPermissao("configuracoes.ver"),
  async (req, res) => {
    try {
      const condominioId = Number(req.params.condominioId);

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const vinculos = await prisma.condominioModulo.findMany({
        where: { condominioId },
        include: { modulo: true },
        orderBy: { modulo: { ordem: "asc" } }
      });

      res.json(vinculos);
    } catch (erro) {
      console.error("Erro ao listar módulos do condomínio:", erro);
      res.status(500).json({ erro: "Erro ao listar módulos do condomínio" });
    }
  }
);

router.patch(
  "/condominio/:condominioId/:moduloId",
  validarPermissao("configuracoes.editar"),
  async (req, res) => {
    try {
      const condominioId = Number(req.params.condominioId);
      const moduloId = Number(req.params.moduloId);
      const { ativo } = req.body;

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const vinculo = await prisma.condominioModulo.upsert({
        where: {
          condominioId_moduloId: {
            condominioId,
            moduloId
          }
        },
        update: {
          ativo: Boolean(ativo)
        },
        create: {
          condominioId,
          moduloId,
          ativo: Boolean(ativo)
        },
        include: {
          modulo: true
        }
      });

      res.json(vinculo);
    } catch (erro) {
      console.error("Erro ao atualizar módulo:", erro);
      res.status(500).json({ erro: "Erro ao atualizar módulo" });
    }
  }
);

module.exports = router;
