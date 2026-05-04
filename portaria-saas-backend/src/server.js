require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const acessoRoutes = require("./routes/acesso.routes");
const integradoresRoutes = require("./routes/integradores.routes");
const temaRoutes = require("./routes/tema.routes");
const modulosRoutes = require("./routes/modulos.routes");
const perfilRoutes = require("./routes/perfil.routes");
const configuracoesRoutes = require("./routes/configuracoes.routes");
const visitantesRoutes = require("./routes/visitantes.routes");
const dispositivosRoutes = require("./routes/dispositivos.routes");
const pessoasRoutes = require("./routes/pessoas.routes");
const portaoRoutes = require("./routes/portao.routes");
const eventosRoutes = require("./routes/eventos.routes");
const credenciaisRoutes = require("./routes/credenciais.routes");
const unidadesRoutes = require("./routes/unidades.routes");
const moradoresRoutes = require("./routes/moradores.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const condominiosRoutes = require("./routes/condominios.routes");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middlewares/auth.middleware");

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/auth", authRoutes);
app.use("/condominios", condominiosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/unidades", unidadesRoutes);
app.use("/moradores", moradoresRoutes);
app.use("/credenciais", credenciaisRoutes);
app.use("/eventos", eventosRoutes);
app.use("/portao", portaoRoutes);
app.use("/pessoas", pessoasRoutes);
app.use("/dispositivos", dispositivosRoutes);
app.use("/visitantes", visitantesRoutes);
app.use("/configuracoes", configuracoesRoutes);
app.use("/perfil", perfilRoutes);
app.use("/modulos", modulosRoutes);
app.use("/tema", temaRoutes);
app.use("/integradores", integradoresRoutes);
app.use("/acesso", acessoRoutes);

app.get("/protegido", authMiddleware, (req, res) => {
  res.json({
    mensagem: "Você está autenticado",
    usuario: req.usuario
  });
});

app.get("/", (req, res) => {
  res.json({
    app: "Portaria SaaS Backend",
    status: "online"
  });
});

app.get("/health", async (req, res) => {
  const totalCondominios = await prisma.condominio.count();

  res.json({
    status: "ok",
    database: "connected",
    condominios: totalCondominios
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend SaaS rodando na porta ${PORT}`);
});
