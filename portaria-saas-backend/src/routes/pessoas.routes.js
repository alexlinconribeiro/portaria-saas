const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// LISTAR
router.get("/", async (req, res) => {
  const { condominioId } = req.query;

  const pessoas = await prisma.pessoa.findMany({
    where: condominioId
      ? { condominioId: Number(condominioId) }
      : undefined,
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
});

// CRIAR
router.post("/", async (req, res) => {
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

  const pessoa = await prisma.pessoa.create({
  data: {
    condominioId: Number(condominioId),
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

  // vínculo com unidade (se houver)
  if (unidadeId) {
    await prisma.pessoaUnidade.create({
      data: {
        pessoaId: pessoa.id,
        unidadeId
      }
    });
  }

  res.json(pessoa);
});

// EDITAR
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
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
    ativo
  } = req.body;

  const pessoa = await prisma.pessoa.update({
    where: { id: Number(id) },
    data: {
      empresaId: empresaId !== undefined && empresaId !== "" ? Number(empresaId) : undefined,
      nome: nome ?? undefined,
      documento: documento ?? undefined,
      rg: rg ?? undefined,
      telefone: telefone ?? undefined,
      email: email ?? undefined,
      tipo: tipo ?? undefined,
      funcao: funcao ?? undefined,
      observacao: observacao ?? undefined,
      validadeInicio: validadeInicio ? new Date(validadeInicio) : undefined,
      validadeFim: validadeFim ? new Date(validadeFim) : undefined,
      ativo: ativo ?? undefined
    }
  });

  res.json(pessoa);
});

module.exports = router;
