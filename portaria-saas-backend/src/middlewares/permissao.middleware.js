function validarPermissao(permissaoNecessaria) {
  return (req, res, next) => {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (usuario.perfil === "SUPER_ADMIN") {
      return next();
    }

    const permissoes = usuario.permissoes || [];

    if (!permissoes.includes(permissaoNecessaria)) {
      return res.status(403).json({
        erro: "Sem permissão",
        permissaoNecessaria
      });
    }

    next();
  };
}

module.exports = {
  validarPermissao
};
