const express = require("express");
const { PrismaClient } = require("@prisma/client");

const authMiddleware = require("../middlewares/auth.middleware");
const { validarModulo } = require("../middlewares/modulo.middleware");
const { validarPermissao } = require("../middlewares/permissao.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.post(
  "/validar",
  validarModulo("portaria"),
  validarPermissao("portaria.operar"),
  async (req, res) => {
    try {
      const { tipo, identificador, dispositivoId } = req.body;

      if (!tipo || !identificador) {
        return res.status(400).json({
          autorizado: false,
          status: "NEGADO",
          mensagem: "tipo e identificador são obrigatórios"
        });
      }

      const where = {
        tipo,
        identificador,
        ativo: true
      };

      if (req.usuario.perfil !== "SUPER_ADMIN") {
        where.condominioId = Number(req.usuario.condominioId);
      }

      const credencial = await prisma.credencialAcesso.findFirst({
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
          condominio: true
        }
      });

      if (!credencial || !credencial.pessoa) {
        const condominioId =
          req.usuario.perfil === "SUPER_ADMIN"
            ? null
            : Number(req.usuario.condominioId);

        if (condominioId) {
          await prisma.eventoAcesso.create({
            data: {
              condominioId,
              dispositivoId: dispositivoId ? Number(dispositivoId) : null,
              tipo,
              origem: "CREDENCIAL",
              nome: "Desconhecido",
              status: "NEGADO"
            }
          });
        }

        return res.status(404).json({
          autorizado: false,
          status: "NEGADO",
          mensagem: "Credencial não encontrada ou inativa"
        });
      }

      const unidadePrincipal = credencial.pessoa.unidades?.[0]?.unidade || null;

      const evento = await prisma.eventoAcesso.create({
        data: {
          condominioId: credencial.condominioId,
          pessoaId: credencial.pessoaId,
          dispositivoId: dispositivoId ? Number(dispositivoId) : null,
          tipo,
          origem: "CREDENCIAL",
          nome: credencial.pessoa.nome,
          unidade: unidadePrincipal?.identificacao || null,
          status: "AUTORIZADO"
        }
      });

      res.json({
        autorizado: true,
        status: "AUTORIZADO",
        mensagem: "Acesso liberado",
        eventoId: evento.id,
        pessoa: {
          id: credencial.pessoa.id,
          nome: credencial.pessoa.nome,
          tipo: credencial.pessoa.tipo
        },
        unidade: unidadePrincipal
          ? {
              id: unidadePrincipal.id,
              bloco: unidadePrincipal.bloco,
              identificacao: unidadePrincipal.identificacao
            }
          : null
      });
    } catch (erro) {
      console.error("Erro ao validar acesso:", erro);

      res.status(500).json({
        autorizado: false,
        status: "ERRO",
        mensagem: "Erro interno ao validar acesso",
        detalhe: erro.message
      });
    }
  }
);

module.exports = router;