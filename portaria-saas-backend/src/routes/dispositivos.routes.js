const express = require("express");
const net = require("net");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const permitirPerfis = require("../middlewares/perfil.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

function getCondominioId(req) {
  if (req.usuario.perfil === "SUPER_ADMIN") {
    return req.body.condominioId || req.query.condominioId;
  }

  return req.usuario.condominioId;
}

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

// LISTAR
router.get("/", async (req, res) => {
  try {
    const where = {};

    if (req.usuario.perfil === "SUPER_ADMIN") {
      if (req.query.condominioId) {
        where.condominioId = Number(req.query.condominioId);
      }
    } else {
      where.condominioId = Number(req.usuario.condominioId);
    }

    const dispositivos = await prisma.dispositivo.findMany({
      where,
      orderBy: { id: "desc" }
    });

    res.json(dispositivos);
  } catch (erro) {
    console.error("Erro ao listar dispositivos:", erro);
    res.status(500).json({ erro: "Erro ao listar dispositivos" });
  }
});

// CRIAR
router.post(
  "/",
  permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO", "TECNICO"),
  async (req, res) => {
    try {
      const condominioId = Number(getCondominioId(req));

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
        config
      } = req.body;

      if (!condominioId || !nome || !tipo) {
        return res.status(400).json({
          erro: "condominioId, nome e tipo são obrigatórios"
        });
      }

      const dispositivo = await prisma.dispositivo.create({
        data: {
          condominioId,
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
    } catch (erro) {
      console.error("Erro ao criar dispositivo:", erro);
      res.status(500).json({ erro: "Erro ao criar dispositivo" });
    }
  }
);

// EDITAR
router.put(
  "/:id",
  permitirPerfis("SUPER_ADMIN", "ADMIN_CONDOMINIO", "TECNICO"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const dispositivoAtual = await prisma.dispositivo.findUnique({
        where: { id }
      });

      if (!dispositivoAtual) {
        return res.status(404).json({ erro: "Dispositivo não encontrado" });
      }

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        dispositivoAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

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
    } catch (erro) {
      console.error("Erro ao editar dispositivo:", erro);
      res.status(500).json({ erro: "Erro ao editar dispositivo" });
    }
  }
);

// TESTAR CONEXÃO
router.post("/:id/check", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const dispositivo = await prisma.dispositivo.findUnique({
      where: { id }
    });

    if (!dispositivo) {
      return res.status(404).json({ erro: "Dispositivo não encontrado" });
    }

    if (
      req.usuario.perfil !== "SUPER_ADMIN" &&
      dispositivo.condominioId !== Number(req.usuario.condominioId)
    ) {
      return res.status(403).json({ erro: "Acesso negado" });
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
  } catch (erro) {
    console.error("Erro ao testar dispositivo:", erro);
    res.status(500).json({ erro: "Erro ao testar dispositivo" });
  }
});

module.exports = router;