const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");
const { validarModulo } = require("../middlewares/modulo.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// LISTAR
router.get(
  "/",
  validarModulo("gestao_moradores"),
  validarPermissao("moradores.ver"),
  async (req, res) => {
    try {
      const { condominioId } = req.query;

      let where = {};

      if (req.usuario.perfil === "SUPER_ADMIN") {
        if (condominioId) {
          where.condominioId = Number(condominioId);
        }
      } else {
        where.condominioId = Number(req.usuario.condominioId);
      }

      const pessoas = await prisma.pessoa.findMany({
        where,
        include: {
          unidades: {
            include: {
              unidade: true
            }
          },
          empresa: true
        },
        orderBy: { id: "desc" }
      });

      res.json(pessoas);
    } catch (erro) {
      console.error("Erro ao listar pessoas:", erro);
      res.status(500).json({ erro: "Erro ao listar pessoas" });
    }
  }
);

// CRIAR
router.post(
  "/",
  validarModulo("gestao_moradores"),
  validarPermissao("moradores.criar"),
  async (req, res) => {
    try {
      const {
        condominioId,
        empresaId,
        nome,
        documento,
        rg,
        telefone,
        email,
        tipo,
        funcao,
        observacao,
        validadeInicio,
        validadeFim,
        unidadeId
      } = req.body;

      const condominioFinal =
        req.usuario.perfil === "SUPER_ADMIN"
          ? Number(condominioId)
          : Number(req.usuario.condominioId);

      const pessoa = await prisma.pessoa.create({
        data: {
          condominioId: condominioFinal,
          empresaId: empresaId ? Number(empresaId) : null,
          nome,
          documento: documento || null,
          rg: rg || null,
          telefone: telefone || null,
          email: email || null,
          tipo,
          funcao: funcao || null,
          observacao: observacao || null,
          validadeInicio: validadeInicio ? new Date(validadeInicio) : null,
          validadeFim: validadeFim ? new Date(validadeFim) : null
        }
      });

      if (unidadeId) {
        await prisma.pessoaUnidade.create({
          data: {
            pessoaId: pessoa.id,
            unidadeId: Number(unidadeId)
          }
        });
      }

      res.json(pessoa);
    } catch (erro) {
      console.error("Erro ao criar pessoa:", erro);
      res.status(500).json({ erro: "Erro ao criar pessoa" });
    }
  }
);

// EDITAR
router.put(
  "/:id",
  validarModulo("gestao_moradores"),
  validarPermissao("moradores.editar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const pessoaAtual = await prisma.pessoa.findUnique({
        where: { id }
      });

      if (!pessoaAtual) {
        return res.status(404).json({ erro: "Pessoa não encontrada" });
      }

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        pessoaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const pessoa = await prisma.pessoa.update({
        where: { id },
        data: req.body
      });

      res.json(pessoa);
    } catch (erro) {
      console.error("Erro ao editar pessoa:", erro);
      res.status(500).json({ erro: "Erro ao editar pessoa" });
    }
  }
);

module.exports = router;