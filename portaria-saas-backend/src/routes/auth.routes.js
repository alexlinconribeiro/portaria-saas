const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email }
  });

  if (!usuario || !usuario.ativo) {
    return res.status(401).json({ erro: "Usuário ou senha inválidos" });
  }

  const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaOk) {
    return res.status(401).json({ erro: "Usuário ou senha inválidos" });
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      condominioId: usuario.condominioId
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      condominioId: usuario.condominioId
    }
  });
});

module.exports = router;
