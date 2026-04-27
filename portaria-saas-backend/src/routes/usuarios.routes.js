const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const permitirPerfis = require("../middlewares/perfil.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// apenas autenticado
router.use(authMiddleware);

// criar usuário
router.post("/", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"), async (req, res) => {
  const { nome, email, senha, perfil, condominioId } = req.body;

  if (!nome || !email || !senha || !perfil) {
    return res.status(400).json({ erro: "Dados obrigatórios" });
  }

  // regra: admin_condominio só cria dentro do próprio condomínio
  let condominioFinal = condominioId;

  if (req.usuario.perfil !== "SUPER_ADMIN") {
    condominioFinal = req.usuario.condominioId;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      perfil,
      condominioId: condominioFinal
    }
  });

  res.status(201).json(usuario);
});

// listar usuários
router.get("/", async (req, res) => {
  let where = {};

  if (req.usuario.perfil !== "SUPER_ADMIN") {
    where.condominioId = req.usuario.condominioId;
  }

  const usuarios = await prisma.usuario.findMany({
    where,
    orderBy: { id: "desc" }
  });

  res.json(usuarios);
});
router.put("/:id", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO"), async (req, res) => {
  const id = Number(req.params.id);
  const { nome, email, senha, perfil, condominioId, ativo } = req.body;

  const usuarioAtual = await prisma.usuario.findUnique({
    where: { id }
  });

  if (!usuarioAtual) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  if (
    req.usuario.perfil !== "SUPER_ADMIN" &&
    usuarioAtual.condominioId !== req.usuario.condominioId
  ) {
    return res.status(403).json({ erro: "Acesso negado" });
  }

  const data = {
    nome: nome ?? usuarioAtual.nome,
    email: email ?? usuarioAtual.email,
    perfil: perfil ?? usuarioAtual.perfil,
    ativo: ativo ?? usuarioAtual.ativo
  };

  if (req.usuario.perfil === "SUPER_ADMIN") {
    data.condominioId =
      condominioId === "" || condominioId === null || condominioId === undefined
        ? null
        : Number(condominioId);
  }

  if (senha && senha.trim() !== "") {
    data.senhaHash = await bcrypt.hash(senha, 10);
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data
  });

  res.json(usuario);
});
module.exports = router;
