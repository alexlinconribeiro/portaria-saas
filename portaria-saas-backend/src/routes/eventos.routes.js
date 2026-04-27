const express = require("express");
const { PrismaClient } = require("@prisma/client");



const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

// EVENTO EXTERNO - leitor facial/tag
router.post("/acesso", async (req, res) => {
  const { identificador, tipo, dispositivo } = req.body;

  if (!identificador || !tipo) {
    return res.status(400).json({ erro: "identificador e tipo são obrigatórios" });
  }

  const credencial = await prisma.credencialAcesso.findFirst({
  where: {
    identificador,
    tipo,
    ativo: true
  },
  include: {
    pessoa: {
      include: {
        unidades: {
          include: {
            unidade: true
          }
        }
      }
    }
  }
});

  if (!credencial) {
    return res.status(403).json({
      acesso: "negado",
      motivo: "Credencial não encontrada"
    });
  }

  const pessoa = credencial.pessoa;

if (!pessoa) {
  return res.status(403).json({
    acesso: "negado",
    motivo: "Credencial sem pessoa vinculada"
  });
}

const unidadePrincipal = pessoa.unidades?.[0]?.unidade;
const unidadeTexto = unidadePrincipal
  ? [unidadePrincipal.bloco, unidadePrincipal.identificacao].filter(Boolean).join(" ")
  : "";

  const evento = await prisma.eventoAcesso.create({
  data: {
    condominioId: pessoa.condominioId,
    pessoaId: pessoa.id,
    tipo,
    nome: pessoa.nome,
    unidade: unidadeTexto,
    origem: dispositivo || "Leitor",
    status: "AUTORIZADO"
  }
});

  res.json({
  acesso: "liberado",
  pessoa: pessoa.nome,
  unidade: evento.unidade,
  tipo,
  eventoId: evento.id
});
const axios = require("axios");

// depois de criar o evento
await axios.post("http://localhost:4000/portao/abrir");
});

// LISTAR EVENTOS COM FILTROS
router.get("/acesso", authMiddleware, async (req, res) => {
  const {
    condominioId,
    tipo,
    status,
    moradorId,
    unidade,
    dataInicio,
    dataFim
  } = req.query;

  const where = {};

  if (req.usuario.perfil === "SUPER_ADMIN") {
    if (condominioId) where.condominioId = Number(condominioId);
  } else {
    where.condominioId = req.usuario.condominioId;
  }

  if (tipo) where.tipo = tipo;
  if (status) where.status = status;
  if (moradorId) where.moradorId = Number(moradorId);
  if (unidade) where.unidade = { contains: unidade, mode: "insensitive" };

  if (dataInicio || dataFim) {
    where.criadoEm = {};
    if (dataInicio) where.criadoEm.gte = new Date(dataInicio);
    if (dataFim) where.criadoEm.lte = new Date(dataFim);
  }

  const eventos = await prisma.eventoAcesso.findMany({
    where,
    include: {
  pessoa: {
    include: {
      unidades: {
        include: {
          unidade: true
        }
      }
    }
  },
  morador: {
    include: {
      unidade: true
    }
  },
  dispositivo: true
},
    orderBy: {
      criadoEm: "desc"
    },
    take: 200
  });

  res.json(eventos);
});

module.exports = router;
