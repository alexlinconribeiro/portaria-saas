function whatsappAutomaticoConfigurado(config) {
  return (
    config &&
    config.ativo === true &&
    config.modo === "AUTOMATICO" &&
    config.phoneNumberId &&
    config.accessToken &&
    config.templateEncomenda
  );
}

function limparTelefone(numero) {
  if (!numero) return null;

  const limpo = String(numero).replace(/\D/g, "");

  if (!limpo) return null;

  if (limpo.startsWith("55")) return limpo;

  return `55${limpo}`;
}

function gerarMensagemManual({ unidade, descricao, codigo }) {
  return `📦 Você recebeu uma encomenda!

Unidade: ${unidade}
Descrição: ${descricao || "Encomenda"}

🔐 Código de retirada: ${codigo}

Apresente este código na portaria para retirar.`;
}

async function enviarTemplateEncomenda({ config, telefone, unidade, descricao, codigo }) {
  const numero = limparTelefone(telefone);

  if (!numero) {
    return {
      enviado: false,
      manual: true,
      erro: "Telefone inválido"
    };
  }

  if (!whatsappAutomaticoConfigurado(config)) {
    return {
      enviado: false,
      manual: true,
      erro: "WhatsApp automático não configurado"
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${config.phoneNumberId}/messages`;

    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: numero,
        type: "template",
        template: {
          name: config.templateEncomenda || "encomenda_recebida",
          language: {
            code: config.templateIdioma || "pt_BR"
          },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: unidade },
                { type: "text", text: descricao || "Encomenda" },
                { type: "text", text: codigo }
              ]
            }
          ]
        }
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      return {
        enviado: false,
        manual: true,
        erro: dados?.error?.message || "Erro ao enviar WhatsApp",
        detalhe: dados
      };
    }

    return {
      enviado: true,
      manual: false,
      dados
    };
  } catch (erro) {
    return {
      enviado: false,
      manual: true,
      erro: erro.message
    };
  }
}

module.exports = {
  whatsappAutomaticoConfigurado,
  limparTelefone,
  gerarMensagemManual,
  enviarTemplateEncomenda
};
