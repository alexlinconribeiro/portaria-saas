const express = require("express");
const net = require("net");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const permitirPerfis = require("../middlewares/perfil.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

function testarConexao(ip, porta = 80, timeout = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      resolve(false);
    });

    socket.connect(porta, ip);
  });
}

router.get("/", async (req, res) => {
  const { condominioId } = req.query;

  const where = {};

  if (condominioId) {
    where.condominioId = Number(condominioId);
  }

  const dispositivos = await prisma.dispositivo.findMany({
    where,
    orderBy: { id: "desc" }
  });

  res.json(dispositivos);
});

router.post("/", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO", "TECNICO"), async (req, res) => {
  const {
    condominioId,
    nome,
    tipo,
    fabricante,
    modelo,
    ip,
    porta,
    usuario,
    senha,
    localizacao,
    config
  } = req.body;

  if (!condominioId || !nome || !tipo) {
    return res.status(400).json({ erro: "condominioId, nome e tipo são obrigatórios" });
  }

  const dispositivo = await prisma.dispositivo.create({
    data: {
      condominioId: Number(condominioId),
      nome,
      tipo,
      fabricante: fabricante || null,
      modelo: modelo || null,
      ip: ip || null,
      porta: porta ? Number(porta) : 80,
      usuario: usuario || null,
      senha: senha || null,
      localizacao: localizacao || null,
      config: config || null,
      status: "DESCONHECIDO"
    }
  });

  res.status(201).json(dispositivo);
});

router.put("/:id", permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO", "TECNICO"), async (req, res) => {
  const id = Number(req.params.id);

  const {
    nome,
    tipo,
    fabricante,
    modelo,
    ip,
    porta,
    usuario,
    senha,
    localizacao,
    ativo,
    config
  } = req.body;

  const dispositivo = await prisma.dispositivo.update({
    where: { id },
    data: {
      nome: nome ?? undefined,
      tipo: tipo ?? undefined,
      fabricante: fabricante ?? undefined,
      modelo: modelo ?? undefined,
      ip: ip ?? undefined,
      porta: porta ? Number(porta) : undefined,
      usuario: usuario ?? undefined,
      senha: senha ?? undefined,
      localizacao: localizacao ?? undefined,
      ativo: ativo ?? undefined,
      config: config ?? undefined
    }
  });

  res.json(dispositivo);
});

router.post("/:id/check", async (req, res) => {
  const id = Number(req.params.id);

  const dispositivo = await prisma.dispositivo.findUnique({
    where: { id }
  });

  if (!dispositivo) {
    return res.status(404).json({ erro: "Dispositivo não encontrado" });
  }

  if (!dispositivo.ip) {
    return res.status(400).json({ erro: "Dispositivo sem IP configurado" });
  }

  const online = await testarConexao(dispositivo.ip, dispositivo.porta || 80);

  const atualizado = await prisma.dispositivo.update({
    where: { id },
    data: {
      status: online ? "ONLINE" : "OFFLINE",
      ultimoCheck: new Date()
    }
  });

  res.json(atualizado);
});

module.exports = router;
