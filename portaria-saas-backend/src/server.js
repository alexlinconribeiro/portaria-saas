require("dotenv").config();

const dispositivosRoutes = require("./routes/dispositivos.routes");
const pessoasRoutes = require("./routes/pessoas.routes");
const portaoRoutes = require("./routes/portao.routes");
const eventosRoutes = require("./routes/eventos.routes");
const credenciaisRoutes = require("./routes/credenciais.routes");
const unidadesRoutes = require("./routes/unidades.routes");
const moradoresRoutes = require("./routes/moradores.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const condominiosRoutes = require("./routes/condominios.routes");
const authMiddleware = require("./middlewares/auth.middleware");
const authRoutes = require("./routes/auth.routes");
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");


const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
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
