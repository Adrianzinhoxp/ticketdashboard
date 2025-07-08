const fs = require("fs")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log("🎫 CONFIGURAÇÃO DO BOT DE TICKETS")
console.log("================================\n")

const config = {}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function setup() {
  try {
    console.log("📋 Vamos configurar seu bot passo a passo:\n")

    // Token do bot
    console.log("1️⃣ TOKEN DO BOT")
    console.log("   • Acesse: https://discord.com/developers/applications")
    console.log('   • Vá em "Bot" e copie o token\n')
    config.BOT_TOKEN = await askQuestion("🔑 Cole o token do bot: ")

    if (!config.BOT_TOKEN) {
      console.log("❌ Token é obrigatório!")
      process.exit(1)
    }

    // ID do servidor
    console.log("\n2️⃣ ID DO SERVIDOR")
    console.log("   • Clique com botão direito no nome do servidor")
    console.log('   • Selecione "Copiar ID do servidor"')
    console.log("   • Ative o Modo Desenvolvedor se necessário\n")
    config.GUILD_ID = await askQuestion("🏠 ID do servidor: ")

    if (!config.GUILD_ID) {
      console.log("❌ ID do servidor é obrigatório!")
      process.exit(1)
    }

    // ID da categoria para tickets
    console.log("\n3️⃣ CATEGORIA DOS TICKETS (opcional)")
    console.log("   • Crie uma categoria no seu servidor")
    console.log("   • Clique com botão direito na categoria")
    console.log('   • Selecione "Copiar ID"\n')
    config.TICKET_CATEGORY_ID = await askQuestion("📁 ID da categoria para tickets (opcional): ")

    // ID do cargo da staff
    console.log("\n4️⃣ CARGO DA STAFF (opcional)")
    console.log("   • Clique com botão direito no cargo da staff")
    console.log('   • Selecione "Copiar ID"\n')
    config.STAFF_ROLE_ID = await askQuestion("👮 ID do cargo da staff (opcional): ")

    // Prefixo dos comandos
    console.log("\n5️⃣ PREFIXO DOS COMANDOS")
    config.COMMAND_PREFIX = (await askQuestion("⚡ Prefixo dos comandos (padrão: !): ")) || "!"

    // URL da imagem do painel
    console.log("\n6️⃣ IMAGEM DO PAINEL (opcional)")
    console.log("   • URL da imagem que será exibida no painel principal")
    console.log("   • Formatos suportados: PNG, JPG, GIF")
    console.log("   • Recomendado: 600x400 pixels ou similar\n")
    config.PANEL_IMAGE_URL = await askQuestion("🖼️ URL da imagem do painel (opcional): ")

    // Criar arquivo de configuração
    const configContent = `// Configuração do Bot de Tickets
// Gerado automaticamente pelo setup

module.exports = {
  // Token do bot (OBRIGATÓRIO)
  BOT_TOKEN: "${config.BOT_TOKEN}",
  
  // ID do servidor (OBRIGATÓRIO)
  GUILD_ID: "${config.GUILD_ID}",
  
  // ID do canal onde o painel de tickets será enviado
  TICKET_CHANNEL_ID: "",
  
  // ID da categoria onde os tickets serão criados
  TICKET_CATEGORY_ID: "${config.TICKET_CATEGORY_ID || ""}",
  
  // ID do cargo da staff que pode gerenciar tickets
  STAFF_ROLE_ID: "${config.STAFF_ROLE_ID || ""}",
  
  // Prefixo dos comandos
  COMMAND_PREFIX: "${config.COMMAND_PREFIX}",

  // URL da imagem do painel principal
  PANEL_IMAGE_URL: "${config.PANEL_IMAGE_URL || ""}",
  
  // Configurações das categorias de tickets
  TICKET_CATEGORIES: {
    corregedoria: {
      name: "corregedoria",
      emoji: "⚠️",
      title: "Corregedoria",
      description: "Ticket para reportar problemas ou violações",
      color: "#ff0000"
    },
    up_patente: {
      name: "up-patente",
      emoji: "🏆",
      title: "Up de Patente",
      description: "Ticket para solicitar promoção de cargo",
      color: "#ffd700"
    },
    duvidas: {
      name: "duvidas",
      emoji: "❓",
      title: "Dúvidas",
      description: "Ticket para tirar dúvidas gerais",
      color: "#0099ff"
    }
  }
};`

    fs.writeFileSync("config.js", configContent)

    console.log("\n✅ CONFIGURAÇÃO CONCLUÍDA!")
    console.log("==========================")
    console.log("📁 Arquivo config.js criado com sucesso!")
    console.log("\n📋 PRÓXIMOS PASSOS:")
    console.log("1. Execute: npm start")
    console.log("2. Convide o bot para seu servidor")
    console.log("3. Use /adrian-config para configurar o canal")
    console.log(`4. Use ${config.COMMAND_PREFIX}setup-tickets para criar o painel`)
    console.log("\n🔗 LINK DE CONVITE:")
    console.log("Será exibido quando o bot iniciar!\n")
  } catch (error) {
    console.error("❌ Erro durante a configuração:", error.message)
  } finally {
    rl.close()
  }
}

setup()
