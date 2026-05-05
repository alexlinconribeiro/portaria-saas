const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");
const { validarModulo } = require("../middlewares/modulo.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// LISTAR VISITANTES
router.get(
  "/",
  validarModulo("gestao_visitantes"),
  validarPermissao("visitantes.ver"),
  async (req, res) => {
    try {
      const { condominioId, status } = req.query;

      const where = {};

      if (req.usuario?.perfil !== "SUPER_ADMIN") {
        where.condominioId = Number(req.usuario.condominioId);
      } else if (condominioId) {
        where.condominioId = Number(condominioId);
      }

      if (status) {
        where.status = status;
      }

      const visitas = await prisma.visita.findMany({
        where,
        include: {
          unidade: true,
          pessoaResponsavel: true,
          autorizadoPorPessoa: true,
          dispositivo: true
        },
        orderBy: { id: "desc" }
      });

      res.json(visitas);
    } catch (erro) {
      console.error("Erro ao listar visitantes:", erro);
      res.status(500).json({ erro: "Erro ao listar visitantes" });
    }
  }
);

// CRIAR VISITA
router.post(
  "/",
  validarModulo("gestao_visitantes"),
  validarPermissao("visitantes.criar"),
  async (req, res) => {
    try {
      const {
        condominioId,
        unidadeId,
        pessoaResponsavelId,
        nomeVisitante,
        documento,
        telefone,
        motivo,
        tipo,
        dataPrevista
      } = req.body;

      const condominioFinal =
        req.usuario?.perfil === "SUPER_ADMIN"
          ? Number(condominioId)
          : Number(req.usuario.condominioId);

      if (!condominioFinal || !nomeVisitante) {
        return res.status(400).json({
          erro: "condominioId e nomeVisitante são obrigatórios"
        });
      }

      const visita = await prisma.visita.create({
        data: {
          condominioId: condominioFinal,
          unidadeId: unidadeId ? Number(unidadeId) : null,
          pessoaResponsavelId: pessoaResponsavelId
            ? Number(pessoaResponsavelId)
            : null,
          nomeVisitante,
          documento: documento || null,
          telefone: telefone || null,
          motivo: motivo || null,
          tipo: tipo || "AVULSA",
          dataPrevista: dataPrevista ? new Date(dataPrevista) : null
        }
      });

      res.status(201).json(visita);
    } catch (erro) {
      console.error("Erro ao criar visitante:", erro);
      res.status(500).json({ erro: "Erro ao criar visitante" });
    }
  }
);

// AUTORIZAR
router.patch(
  "/:id/autorizar",
  validarModulo("gestao_visitantes"),
  validarPermissao("visitantes.autorizar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const visitaAtual = await prisma.visita.findUnique({
        where: { id }
      });

      if (!visitaAtual) {
        return res.status(404).json({ erro: "Visita não encontrada" });
      }

      if (
        req.usuario?.perfil !== "SUPER_ADMIN" &&
        visitaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado ao condomínio" });
      }

      const visita = await prisma.visita.update({
        where: { id },
        data: {
          status: "AUTORIZADO",
          autorizadoEm: new Date(),
          autorizadoPorId: req.usuario?.id || null,
          autorizadoPorPessoaId: req.body?.pessoaId || null
        }
      });

      res.json(visita);
    } catch (erro) {
      console.error("Erro ao autorizar visitante:", erro);
      res.status(500).json({ erro: "Erro ao autorizar visitante" });
    }
  }
);

// NEGAR
router.patch(
  "/:id/negar",
  validarModulo("gestao_visitantes"),
  validarPermissao("visitantes.negar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const visitaAtual = await prisma.visita.findUnique({
        where: { id }
      });

      if (!visitaAtual) {
        return res.status(404).json({ erro: "Visita não encontrada" });
      }

      if (
        req.usuario?.perfil !== "SUPER_ADMIN" &&
        visitaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado ao condomínio" });
      }

      const visita = await prisma.visita.update({
        where: { id },
        data: {
          status: "NEGADO",
          negadoEm: new Date(),
          autorizadoPorId: req.usuario?.id || null,
          autorizadoPorPessoaId: req.body?.pessoaId || null
        }
      });

      res.json(visita);
    } catch (erro) {
      console.error("Erro ao negar visitante:", erro);
      res.status(500).json({ erro: "Erro ao negar visitante" });
    }
  }
);

// REGISTRAR ENTRADA
router.patch(
  "/:id/entrada",
  validarModulo("gestao_visitantes"),
  validarPermissao("visitantes.autorizar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const visitaAtual = await prisma.visita.findUnique({
        where: { id },
        include: {
          unidade: true,
          pessoaResponsavel: true
        }
      });

      if (!visitaAtual) {
        return res.status(404).json({ erro: "Visita não encontrada" });
      }

      if (
        req.usuario?.perfil !== "SUPER_ADMIN" &&
        visitaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado ao condomínio" });
      }

      const visita = await prisma.visita.update({
        where: { id },
        data: {
          status: "EM_ANDAMENTO",
          entradaEm: new Date(),
          dispositivoId: req.body.dispositivoId || null
        },
        include: {
          unidade: true,
          pessoaResponsavel: true
        }
      });

      await prisma.eventoAcesso.create({
        data: {
          condominioId: visita.condominioId,
          pessoaId: visita.pessoaResponsavelId || null,
          dispositivoId: visita.dispositivoId || null,
          tipo: "VISITANTE_MANUAL",
          origem: "VISITANTES",
          nome: visita.nomeVisitante,
          unidade: visita.unidade?.identificacao || null,
          status: "AUTORIZADO"
        }
      });

      res.json(visita);
    } catch (erro) {
      console.error("Erro ao registrar entrada:", erro);
      res.status(500).json({ erro: "Erro ao registrar entrada" });
    }
  }
);

// REGISTRAR SAÍDA
router.patch(
  "/:id/saida",
  validarModulo("gestao_visitantes"),
  validarPermissao("visitantes.autorizar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const visitaAtual = await prisma.visita.findUnique({
        where: { id }
      });

      if (!visitaAtual) {
        return res.status(404).json({ erro: "Visita não encontrada" });
      }

      if (
        req.usuario?.perfil !== "SUPER_ADMIN" &&
        visitaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado ao condomínio" });
      }

      const visita = await prisma.visita.update({
        where: { id },
        data: {
          status: "FINALIZADO",
          saidaEm: new Date()
        }
      });

      res.json(visita);
    } catch (erro) {
      console.error("Erro ao registrar saída:", erro);
      res.status(500).json({ erro: "Erro ao registrar saída" });
    }
  }
);

// CANCELAR
router.patch(
  "/:id/cancelar",
  validarModulo("gestao_visitantes"),
  validarPermissao("visitantes.negar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const visitaAtual = await prisma.visita.findUnique({
        where: { id }
      });

      if (!visitaAtual) {
        return res.status(404).json({ erro: "Visita não encontrada" });
      }

      if (
        req.usuario?.perfil !== "SUPER_ADMIN" &&
        visitaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado ao condomínio" });
      }

      const visita = await prisma.visita.update({
        where: { id },
        data: {
          status: "CANCELADO",
          canceladoEm: new Date()
        }
      });

      res.json(visita);
    } catch (erro) {
      console.error("Erro ao cancelar visitante:", erro);
      res.status(500).json({ erro: "Erro ao cancelar visitante" });
    }
  }
);

module.exports = router;