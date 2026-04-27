	const express = require("express");

const router = express.Router();

router.post("/abrir", async (req, res) => {
  console.log("🚪 PORTÃO ABERTO");

  // aqui no futuro entra:
  // GPIO / relay / API Intelbras

  res.json({
    status: "ok",
    mensagem: "Portão aberto com sucesso"
  });
});

module.exports = router;
