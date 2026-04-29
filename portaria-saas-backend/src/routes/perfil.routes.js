const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.usuario.id },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      tema: true,
      condominioId: true,
      ativo: true,
      criadoEm: true
    }
  });

  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  res.json(usuario);
});

router.put("/", async (req, res) => {
  const { nome, tema } = req.body;

  const usuario = await prisma.usuario.update({
    where: { id: req.usuario.id },
    data: {
      nome: nome ?? undefined,
      tema: tema ?? undefined
    },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      tema: true,
      condominioId: true
    }
  });

  res.json(usuario);
});

router.put("/senha", async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ erro: "Senha atual e nova senha são obrigatórias" });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: req.usuario.id }
  });

  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);

  if (!senhaValida) {
    return res.status(400).json({ erro: "Senha atual inválida" });
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.usuario.update({
    where: { id: req.usuario.id },
    data: { senhaHash }
  });

  res.json({ status: "ok", mensagem: "Senha alterada com sucesso" });
});

module.exports = router;
