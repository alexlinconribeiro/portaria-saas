const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const permitirPerfis = require("../middlewares/perfil.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(permitirPerfis("SUPER_ADMIN"));

router.get("/", async (req, res) => {
  const condominios = await prisma.condominio.findMany({
    orderBy: { id: "desc" }
  });

  res.json(condominios);
});

router.post("/", async (req, res) => {
  const {
  nome,
  documento,
  telefone,
  email,
  responsavel,
  cep,
  endereco,
  numero,
  bairro,
  cidade,
  estado
} = req.body;

  if (!nome) {
    return res.status(400).json({ erro: "Nome é obrigatório" });
  }

  const condominio = await prisma.condominio.create({
 	data: {
  nome,
  documento: documento || null,
  telefone: telefone || null,
  email: email || null,
  responsavel: responsavel || null,
  cep: cep || null,
  endereco: endereco || null,
  numero: numero || null,
  bairro: bairro || null,
  cidade: cidade || null,
  estado: estado || null
}
  });

  res.status(201).json(condominio);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const condominio = await prisma.condominio.findUnique({
    where: { id }
  });

  if (!condominio) {
    return res.status(404).json({ erro: "Condomínio não encontrado" });
  }

  res.json(condominio);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const {
  nome,
  documento,
  telefone,
  email,
  responsavel,
  cep,
  endereco,
  numero,
  bairro,
  cidade,
  estado,
  ativo
} = req.body;

  const existe = await prisma.condominio.findUnique({
    where: { id }
  });

  if (!existe) {
    return res.status(404).json({ erro: "Condomínio não encontrado" });
  }

  const condominio = await prisma.condominio.update({
  where: { id },
  data: {
    nome: nome ?? undefined,
    documento: documento ?? undefined,
    telefone: telefone ?? undefined,
    email: email ?? undefined,
    responsavel: responsavel ?? undefined,
    cep: cep ?? undefined,
    endereco: endereco ?? undefined,
    numero: numero ?? undefined,
    bairro: bairro ?? undefined,
    cidade: cidade ?? undefined,
    estado: estado ?? undefined,
    ativo: ativo ?? undefined
  }
});

  res.json(condominio);
});

module.exports = router;
