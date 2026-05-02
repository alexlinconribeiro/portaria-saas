const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  try {
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

    const perfilPermissoes = await prisma.perfilPermissao.findMany({
      where: {
        perfil: usuario.perfil
      },
      include: {
        permissao: true
      }
    });

    const permissoes = perfilPermissoes.map((item) => item.permissao.chave);

    const modulosVinculados = usuario.condominioId
      ? await prisma.condominioModulo.findMany({
          where: {
            condominioId: Number(usuario.condominioId),
            ativo: true,
            modulo: {
              ativo: true
            }
          },
          include: {
            modulo: true
          }
        })
      : [];

    const modulos = modulosVinculados.map((item) => item.modulo.chave);

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        condominioId: usuario.condominioId,
        permissoes,
        modulos
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
        condominioId: usuario.condominioId,
        permissoes,
        modulos
      }
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ erro: "Erro interno ao realizar login" });
  }
});

module.exports = router;