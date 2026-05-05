const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");
const { validarModulo } = require("../middlewares/modulo.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

function getCondominioId(req) {
  if (req.usuario.perfil === "SUPER_ADMIN") {
    return req.body.condominioId || req.query.condominioId;
  }

  return req.usuario.condominioId;
}

// LISTAR
router.get(
  "/",
  validarModulo("gestao_moradores"),
  validarPermissao("unidades.ver"),
  async (req, res) => {
    try {
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
    } catch (erro) {
      console.error("Erro ao listar unidades:", erro);
      res.status(500).json({ erro: "Erro ao listar unidades" });
    }
  }
);

// CRIAR
router.post(
  "/",
  validarModulo("gestao_moradores"),
  validarPermissao("unidades.criar"),
  async (req, res) => {
    try {
      const condominioId = Number(getCondominioId(req));
      const { bloco, identificacao } = req.body;

      if (!condominioId || !identificacao) {
        return res.status(400).json({
          erro: "condominioId e identificacao são obrigatórios"
        });
      }

      const unidade = await prisma.unidade.create({
        data: {
          condominioId,
          bloco: bloco || null,
          identificacao
        }
      });

      res.status(201).json(unidade);
    } catch (erro) {
      console.error("Erro ao criar unidade:", erro);
      res.status(500).json({ erro: "Erro ao criar unidade" });
    }
  }
);

// EDITAR
router.put(
  "/:id",
  validarModulo("gestao_moradores"),
  validarPermissao("unidades.editar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const unidadeAtual = await prisma.unidade.findUnique({
        where: { id }
      });

      if (!unidadeAtual) {
        return res.status(404).json({ erro: "Unidade não encontrada" });
      }

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        unidadeAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const unidade = await prisma.unidade.update({
        where: { id },
        data: req.body
      });

      res.json(unidade);
    } catch (erro) {
      console.error("Erro ao editar unidade:", erro);
      res.status(500).json({ erro: "Erro ao editar unidade" });
    }
  }
);

module.exports = router;