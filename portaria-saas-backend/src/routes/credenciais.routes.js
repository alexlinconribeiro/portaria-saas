const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const permitirPerfis = require("../middlewares/perfil.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// LISTAR
router.get("/", async (req, res) => {
  try {
    const { condominioId, pessoaId } = req.query;

    const where = {};

    if (req.usuario.perfil !== "SUPER_ADMIN") {
      where.condominioId = Number(req.usuario.condominioId);
    } else if (condominioId) {
      where.condominioId = Number(condominioId);
    }

    if (pessoaId) {
      where.pessoaId = Number(pessoaId);
    }

    const credenciais = await prisma.credencialAcesso.findMany({
      where,
      include: {
        pessoa: true,
        condominio: true
      },
      orderBy: { id: "desc" }
    });

    res.json(credenciais);
  } catch (erro) {
    console.error("ERRO AO LISTAR CREDENCIAIS:", erro);
    res.status(500).json({ erro: "Erro ao listar credenciais" });
  }
});

// CRIAR
router.post(
  "/",
  permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"),
  async (req, res) => {
    try {
      const { pessoaId, tipo, identificador } = req.body;

      if (!pessoaId || !tipo || !identificador) {
        return res.status(400).json({
          erro: "pessoaId, tipo e identificador são obrigatórios"
        });
      }

      const pessoa = await prisma.pessoa.findUnique({
        where: { id: Number(pessoaId) }
      });

      if (!pessoa) {
        return res.status(404).json({ erro: "Pessoa não encontrada" });
      }

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        pessoa.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const existe = await prisma.credencialAcesso.findFirst({
        where: {
          condominioId: pessoa.condominioId,
          tipo,
          identificador
        }
      });

      if (existe) {
        return res.status(400).json({ erro: "Credencial já cadastrada" });
      }

      const credencial = await prisma.credencialAcesso.create({
        data: {
          condominioId: pessoa.condominioId,
          pessoaId: pessoa.id,
          tipo,
          identificador,
          ativo: true
        },
        include: {
          pessoa: true,
          condominio: true
        }
      });

      res.status(201).json(credencial);
    } catch (erro) {
      console.error("ERRO AO CRIAR CREDENCIAL:", erro);
      res.status(500).json({
        erro: "Erro interno ao criar credencial",
        detalhe: erro.message
      });
    }
  }
);

// ATIVAR / DESATIVAR
router.put(
  "/:id/status",
  permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { ativo } = req.body;

      const atual = await prisma.credencialAcesso.findUnique({
        where: { id }
      });

      if (!atual) {
        return res.status(404).json({ erro: "Credencial não encontrada" });
      }

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        atual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const credencial = await prisma.credencialAcesso.update({
        where: { id },
        data: { ativo: Boolean(ativo) },
        include: {
          pessoa: true,
          condominio: true
        }
      });

      res.json(credencial);
    } catch (erro) {
      console.error("ERRO AO ALTERAR STATUS DA CREDENCIAL:", erro);
      res.status(500).json({ erro: "Erro ao alterar status da credencial" });
    }
  }
);

module.exports = router;