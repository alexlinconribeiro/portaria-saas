function limparTelefone(numero) {
  if (!numero) return null;
  const limpo = String(numero).replace(/\D/g, "");
  if (!limpo) return null;
  return limpo.startsWith("55") ? limpo : `55${limpo}`;
}

function configAtiva(config) {
  return (
    config &&
    config.ativo === true &&
    config.modo === "AUTOMATICO" &&
    config.phoneNumberId &&
    config.accessToken
  );
}

const TEMPLATES = {
  ENCOMENDA_RECEBIDA: {
    campo: "templateEncomenda",
    fallback: "encomenda_recebida"
  },
  VISITANTE_AGUARDANDO: {
    campo: "templateVisitante",
    fallback: "visitante_aguardando"
  },
  ACESSO_LIBERADO: {
    campo: "templateAcesso",
    fallback: "acesso_liberado"
  }
};

function gerarMensagemManual(tipo, dados) {
  if (tipo === "ENCOMENDA_RECEBIDA") {
    return `📦 Você recebeu uma encomenda na portaria.

Unidade: ${dados.unidade}
Código de retirada: ${dados.codigoRetirada}

Apresente este código para retirar.`;
  }

  if (tipo === "VISITANTE_AGUARDANDO") {
    return `🚪 Visitante aguardando autorização.

Unidade: ${dados.unidade}
Visitante: ${dados.nomeVisitante}

A portaria aguarda sua confirmação.`;
  }

  if (tipo === "ACESSO_LIBERADO") {
    return `✅ Acesso liberado.

Pessoa: ${dados.nome}
Unidade: ${dados.unidade}`;
  }

  return "Mensagem do sistema.";
}

async function enviarWhatsapp({ config, telefone, tipo, parametros, dadosManual }) {
  const numero = limparTelefone(telefone);
  const mensagemManual = gerarMensagemManual(tipo, dadosManual || {});

  if (!numero) {
    return {
      enviado: false,
      modoManual: true,
      erro: "Telefone inválido",
      mensagemManual
    };
  }

  if (!configAtiva(config)) {
    return {
      enviado: false,
      modoManual: true,
      erro: "WhatsApp automático não configurado",
      mensagemManual
    };
  }

  const templateInfo = TEMPLATES[tipo];

  if (!templateInfo) {
    return {
      enviado: false,
      modoManual: true,
      erro: "Tipo de template inválido",
      mensagemManual
    };
  }

  const templateName =
    config[templateInfo.campo] || templateInfo.fallback;

  try {
    const resposta = await fetch(
      `https://graph.facebook.com/v20.0/${config.phoneNumberId}/messages`,
      {
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
            name: templateName,
            language: {
              code: config.templateIdioma || "pt_BR"
            },
            components: [
              {
                type: "body",
                parameters: parametros.map((texto) => ({
                  type: "text",
                  text: String(texto || "-")
                }))
              }
            ]
          }
        })
      }
    );

    const retorno = await resposta.json();

    if (!resposta.ok) {
      return {
        enviado: false,
        modoManual: true,
        erro: retorno?.error?.message || "Erro ao enviar WhatsApp",
        detalhe: retorno,
        mensagemManual
      };
    }

    return {
      enviado: true,
      modoManual: false,
      retorno
    };
  } catch (erro) {
    return {
      enviado: false,
      modoManual: true,
      erro: erro.message,
      mensagemManual
    };
  }
}

module.exports = {
  enviarWhatsapp,
  gerarMensagemManual,
  limparTelefone
};