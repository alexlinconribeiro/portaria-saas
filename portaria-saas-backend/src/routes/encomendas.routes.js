const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");
const { validarModulo } = require("../middlewares/modulo.middleware");
const {
  gerarMensagemManual,
  enviarTemplateEncomenda
} = require("../services/whatsapp.service");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

function gerarCodigoRetirada() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getCondominioId(req) {
  if (req.usuario.perfil === "SUPER_ADMIN") {
    return req.body.condominioId || req.query.condominioId;
  }

  return req.usuario.condominioId;
}

function nomeUnidade(unidade) {
  if (!unidade) return "-";
  return `${unidade.bloco ? `${unidade.bloco} - ` : ""}${unidade.identificacao}`;
}

async function buscarMoradoresDaUnidade(unidadeId) {
  if (!unidadeId) return [];

  const vinculos = await prisma.pessoaUnidade.findMany({
    where: {
      unidadeId: Number(unidadeId)
    },
    include: {
      pessoa: true
    }
  });

  return vinculos
    .map((v) => v.pessoa)
    .filter((p) => p && p.tipo === "MORADOR" && p.telefone);
}

// LISTAR ENCOMENDAS
router.get(
  "/",
  validarModulo("encomendas"),
  validarPermissao("encomendas.ver"),
  async (req, res) => {
    try {
      const { status } = req.query;
      const condominioId = getCondominioId(req);

      const where = {};

      if (condominioId) {
        where.condominioId = Number(condominioId);
      }

      if (status) {
        where.status = status;
      }

      const encomendas = await prisma.encomenda.findMany({
        where,
        include: {
          unidade: true,
          pessoa: true
        },
        orderBy: { id: "desc" }
      });

      res.json(encomendas);
    } catch (erro) {
      console.error("Erro ao listar encomendas:", erro);
      res.status(500).json({ erro: "Erro ao listar encomendas" });
    }
  }
);

// REGISTRAR ENCOMENDA
router.post(
  "/",
  validarModulo("encomendas"),
  validarPermissao("encomendas.registrar"),
  async (req, res) => {
    try {
      const {
        condominioId,
        unidadeId,
        descricao,
        codigo,
        remetente,
        observacao
      } = req.body;

      const condominioFinal =
        req.usuario.perfil === "SUPER_ADMIN"
          ? Number(condominioId)
          : Number(req.usuario.condominioId);

      if (!condominioFinal) {
        return res.status(400).json({
          erro: "condominioId é obrigatório"
        });
      }

      const codigoRetirada = gerarCodigoRetirada();

      const encomenda = await prisma.encomenda.create({
        data: {
          condominioId: condominioFinal,
          unidadeId: unidadeId ? Number(unidadeId) : null,
          descricao: descricao || null,
          codigo: codigo || null,
          remetente: remetente || null,
          observacao: observacao || null,
          codigoRetirada,
          codigoExpiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          recebidoPorId: req.usuario.id
        },
        include: {
          unidade: true
        }
      });

      const mensagemWhatsapp = gerarMensagemManual({
        unidade: nomeUnidade(encomenda.unidade),
        descricao: encomenda.descricao,
        codigo: encomenda.codigoRetirada
      });

      const atualizado = await prisma.encomenda.update({
        where: { id: encomenda.id },
        data: {
          mensagemWhatsapp
        },
        include: {
          unidade: true
        }
      });

      res.status(201).json(atualizado);
    } catch (erro) {
      console.error("Erro ao registrar encomenda:", erro);
      res.status(500).json({ erro: "Erro ao registrar encomenda" });
    }
  }
);

// NOTIFICAR MORADOR / UNIDADE
router.patch(
  "/:id/notificar",
  validarModulo("encomendas"),
  validarPermissao("encomendas.notificar_morador"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const encomendaAtual = await prisma.encomenda.findUnique({
        where: { id },
        include: {
          unidade: true,
          condominio: {
            include: {
              integrador: {
                include: {
                  whatsappConfig: true
                }
              }
            }
          }
        }
      });

      if (!encomendaAtual) {
        return res.status(404).json({ erro: "Encomenda não encontrada" });
      }

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        encomendaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      let codigoRetirada = encomendaAtual.codigoRetirada;

      if (!codigoRetirada) {
        codigoRetirada = gerarCodigoRetirada();
      }

      const unidadeNome = nomeUnidade(encomendaAtual.unidade);

      const mensagemWhatsapp = gerarMensagemManual({
        unidade: unidadeNome,
        descricao: encomendaAtual.descricao,
        codigo: codigoRetirada
      });

      const moradores = await buscarMoradoresDaUnidade(encomendaAtual.unidadeId);
      const config = encomendaAtual.condominio?.integrador?.whatsappConfig || null;

      const resultados = [];

      for (const morador of moradores) {
        const resultado = await enviarTemplateEncomenda({
          config,
          telefone: morador.telefone,
          unidade: unidadeNome,
          descricao: encomendaAtual.descricao,
          codigo: codigoRetirada
        });

        resultados.push({
          pessoaId: morador.id,
          nome: morador.nome,
          telefone: morador.telefone,
          ...resultado
        });
      }

      const algumEnviado = resultados.some((r) => r.enviado);
      const erros = resultados
        .filter((r) => !r.enviado && r.erro)
        .map((r) => `${r.nome || r.telefone}: ${r.erro}`)
        .join(" | ");

      const encomenda = await prisma.encomenda.update({
        where: { id },
        data: {
          status: "NOTIFICADO",
          notificadoEm: new Date(),
          codigoRetirada,
          codigoExpiraEm:
            encomendaAtual.codigoExpiraEm ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          mensagemWhatsapp,
          whatsappEnviado: algumEnviado,
          whatsappErro: algumEnviado ? null : erros || "Envio automático não realizado"
        },
        include: {
          unidade: true
        }
      });

      res.json({
        encomenda,
        whatsapp: {
          enviadoAutomaticamente: algumEnviado,
          modoManual: !algumEnviado,
          mensagemManual: mensagemWhatsapp,
          destinatarios: resultados
        }
      });
    } catch (erro) {
      console.error("Erro ao notificar encomenda:", erro);
      res.status(500).json({ erro: "Erro ao notificar encomenda" });
    }
  }
);

// VALIDAR CÓDIGO DE RETIRADA
router.get(
  "/retirada/:codigo",
  validarModulo("encomendas"),
  validarPermissao("encomendas.entregar"),
  async (req, res) => {
    try {
      const { codigo } = req.params;
      const condominioId = getCondominioId(req);

      const where = {
        codigoRetirada: codigo,
        status: {
          in: ["PENDENTE", "NOTIFICADO"]
        }
      };

      if (condominioId) {
        where.condominioId = Number(condominioId);
      }

      const encomenda = await prisma.encomenda.findFirst({
        where,
        include: {
          unidade: true
        }
      });

      if (!encomenda) {
        return res.status(404).json({
          valido: false,
          erro: "Código não encontrado ou encomenda já retirada"
        });
      }

      if (encomenda.codigoExpiraEm && encomenda.codigoExpiraEm < new Date()) {
        return res.status(400).json({
          valido: false,
          erro: "Código expirado"
        });
      }

      res.json({
        valido: true,
        encomenda
      });
    } catch (erro) {
      console.error("Erro ao validar código de retirada:", erro);
      res.status(500).json({ erro: "Erro ao validar código de retirada" });
    }
  }
);

// ENTREGAR POR CÓDIGO
router.patch(
  "/retirada/:codigo/confirmar",
  validarModulo("encomendas"),
  validarPermissao("encomendas.entregar"),
  async (req, res) => {
    try {
      const { codigo } = req.params;
      const condominioId = getCondominioId(req);

      const where = {
        codigoRetirada: codigo,
        status: {
          in: ["PENDENTE", "NOTIFICADO"]
        }
      };

      if (condominioId) {
        where.condominioId = Number(condominioId);
      }

      const encomendaAtual = await prisma.encomenda.findFirst({
        where
      });

      if (!encomendaAtual) {
        return res.status(404).json({
          erro: "Código não encontrado ou encomenda já retirada"
        });
      }

      if (
        encomendaAtual.codigoExpiraEm &&
        encomendaAtual.codigoExpiraEm < new Date()
      ) {
        return res.status(400).json({
          erro: "Código expirado"
        });
      }

      const encomenda = await prisma.encomenda.update({
        where: { id: encomendaAtual.id },
        data: {
          status: "RETIRADO",
          retiradoEm: new Date(),
          retiradoPorId: req.usuario.id
        },
        include: {
          unidade: true
        }
      });

      res.json(encomenda);
    } catch (erro) {
      console.error("Erro ao confirmar retirada:", erro);
      res.status(500).json({ erro: "Erro ao confirmar retirada" });
    }
  }
);

// ENTREGAR ENCOMENDA PELO ID
router.patch(
  "/:id/entregar",
  validarModulo("encomendas"),
  validarPermissao("encomendas.entregar"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const encomendaAtual = await prisma.encomenda.findUnique({
        where: { id }
      });

      if (!encomendaAtual) {
        return res.status(404).json({ erro: "Encomenda não encontrada" });
      }

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        encomendaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const encomenda = await prisma.encomenda.update({
        where: { id },
        data: {
          status: "RETIRADO",
          retiradoEm: new Date(),
          retiradoPorId: req.usuario.id
        },
        include: {
          unidade: true
        }
      });

      res.json(encomenda);
    } catch (erro) {
      console.error("Erro ao entregar encomenda:", erro);
      res.status(500).json({ erro: "Erro ao entregar encomenda" });
    }
  }
);

// CANCELAR
router.patch(
  "/:id/cancelar",
  validarModulo("encomendas"),
  validarPermissao("encomendas.excluir"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const encomendaAtual = await prisma.encomenda.findUnique({
        where: { id }
      });

      if (!encomendaAtual) {
        return res.status(404).json({ erro: "Encomenda não encontrada" });
      }

      if (
        req.usuario.perfil !== "SUPER_ADMIN" &&
        encomendaAtual.condominioId !== Number(req.usuario.condominioId)
      ) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const encomenda = await prisma.encomenda.update({
        where: { id },
        data: {
          status: "CANCELADO",
          canceladoEm: new Date()
        },
        include: {
          unidade: true
        }
      });

      res.json(encomenda);
    } catch (erro) {
      console.error("Erro ao cancelar encomenda:", erro);
      res.status(500).json({ erro: "Erro ao cancelar encomenda" });
    }
  }
);

module.exports = router;