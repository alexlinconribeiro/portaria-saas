const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function validarModulo(chaveModulo) {
  return async (req, res, next) => {
    try {
      const usuario = req.usuario;

      if (!usuario) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      if (usuario.perfil === "SUPER_ADMIN") {
        return next();
      }

      if (!usuario.condominioId) {
        return res.status(403).json({ erro: "Usuário sem condomínio vinculado" });
      }

      const moduloAtivo = await prisma.condominioModulo.findFirst({
        where: {
          condominioId: Number(usuario.condominioId),
          ativo: true,
          modulo: {
            chave: chaveModulo,
            ativo: true
          }
        },
        include: {
          modulo: true
        }
      });

      if (!moduloAtivo) {
        return res.status(403).json({
          erro: "Módulo não contratado ou desativado",
          modulo: chaveModulo
        });
      }

      next();
    } catch (erro) {
      console.error("Erro ao validar módulo:", erro);
      return res.status(500).json({ erro: "Erro ao validar módulo" });
    }
  };
}

module.exports = {
  validarModulo
};
