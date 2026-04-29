const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não informado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
      ...decoded,

      // ?? PERMISSÕES TEMPORÁRIAS
      permissoes: [
        "visitantes.ver",
        "visitantes.criar",
        "visitantes.autorizar",
        "visitantes.negar",
        "condominios.ver"
      ]
    };

    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

module.exports = authMiddleware;