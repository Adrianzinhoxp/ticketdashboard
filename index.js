const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  REST,
  Routes,
  SlashCommandBuilder,
  InteractionResponseType,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js")

// Importar configurações
let config
try {
  config = require("./config.js")
} catch (error) {
  console.log("❌ Execute: npm run setup")
  process.exit(1)
}

// Cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})

// Tickets ativos
const activeTickets = new Map()

// Registrar comandos slash
async function registerSlashCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("adrian-config")
      .setDescription("Configurar categoria onde os tickets serão criados")
      .addChannelOption((option) =>
        option.setName("categoria").setDescription("Categoria onde os tickets serão criados").setRequired(true),
      ),
    new SlashCommandBuilder().setName("setup-tickets").setDescription("Criar painel de tickets no canal atual"),
  ]

  const rest = new REST().setToken(config.BOT_TOKEN)

  try {
    console.log("🔄 Registrando comandos slash...")
    await rest.put(Routes.applicationGuildCommands(client.user.id, config.GUILD_ID), { body: commands })
    console.log("✅ Comandos slash registrados!")
  } catch (error) {
    console.error("❌ Erro ao registrar comandos:", error)
  }
}

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} online!`)
  console.log(
    `🔗 Convite: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`,
  )

  // Registrar comandos slash
  await registerSlashCommands()
})

// Comandos slash
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    // Comando /adrian-config
    if (interaction.commandName === "adrian-config") {
      // Verificar permissões
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          content: "❌ Apenas administradores podem usar este comando!",
          flags: MessageFlags.Ephemeral,
        })
      }

      const category = interaction.options.getChannel("categoria")

      // Verificar se é uma categoria
      if (category.type !== ChannelType.GuildCategory) {
        return interaction.reply({
          content: "❌ Por favor, selecione uma categoria, não um canal!",
          flags: MessageFlags.Ephemeral,
        })
      }

      // Salvar configuração
      try {
        const fs = require("fs")
        let configContent = fs.readFileSync("config.js", "utf8")

        // Adicionar ou atualizar TICKET_CATEGORY_ID
        if (configContent.includes("TICKET_CATEGORY_ID:")) {
          configContent = configContent.replace(/TICKET_CATEGORY_ID: ".*"/, `TICKET_CATEGORY_ID: "${category.id}"`)
        } else {
          configContent = configContent.replace(
            'GUILD_ID: "',
            `GUILD_ID: "${config.GUILD_ID}",\n  \n  // ID da categoria onde os tickets serão criados\n  TICKET_CATEGORY_ID: "${category.id}",`,
          )
        }

        fs.writeFileSync("config.js", configContent)

        // Atualizar config em memória
        config.TICKET_CATEGORY_ID = category.id

        const embed = new EmbedBuilder()
          .setTitle("⚙️ Categoria Configurada")
          .setDescription(
            `Categoria de tickets configurada com sucesso!\n\n**Categoria:** ${category.name}\n**ID:** \`${category.id}\``,
          )
          .addFields([
            {
              name: "📋 Próximos passos",
              value:
                "• Use `/setup-tickets` em qualquer canal\n• O painel será criado onde você usar o comando\n• Os tickets serão criados na categoria configurada",
            },
          ])
          .setColor("#00ff00")
          .setTimestamp()

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })

        console.log(`✅ Categoria de tickets configurada: ${category.name} (${category.id})`)
      } catch (error) {
        console.error("❌ Erro ao salvar configuração:", error)
        await interaction.reply({
          content: "❌ Erro ao salvar configuração. Verifique as permissões do arquivo.",
          flags: MessageFlags.Ephemeral,
        })
      }
    }

    // Comando /setup-tickets
    if (interaction.commandName === "setup-tickets") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          content: "❌ Apenas administradores podem usar este comando!",
          flags: MessageFlags.Ephemeral,
        })
      }

      const embed = new EmbedBuilder()
        .setTitle("🎫 SISTEMA DE TICKETS")
        .setDescription(
          "**Bem-vindo ao nosso sistema de atendimento!**\n\n" +
            "Para abrir um ticket, selecione o tipo de atendimento que você precisa no menu abaixo:\n\n" +
            "⚠️ **Corregedoria** - Questões disciplinares e correções\n" +
            "🏆 **Up de Patente** - Solicitações de promoção\n" +
            "❓ **Dúvidas** - Esclarecimentos gerais\n\n" +
            "**Clique no menu abaixo para selecionar uma opção:**",
        )
        .setColor("#000000")

      if (config.PANEL_IMAGE_URL) {
        embed.setImage(config.PANEL_IMAGE_URL)
      }

      embed.setFooter({ text: "Sistema de Atendimento" }).setTimestamp()

      // Menu dropdown para seleção de categoria
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("📋 Selecione o tipo de atendimento...")
        .addOptions([
          new StringSelectMenuOptionBuilder()
            .setLabel("Corregedoria")
            .setDescription("Questões disciplinares e correções")
            .setValue("corregedoria")
            .setEmoji("⚠️"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Up de Patente")
            .setDescription("Solicitações de promoção")
            .setValue("up_patente")
            .setEmoji("🏆"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Dúvidas")
            .setDescription("Esclarecimentos gerais")
            .setValue("duvidas")
            .setEmoji("❓"),
        ])

      const row = new ActionRowBuilder().addComponents(selectMenu)

      await interaction.reply({ embeds: [embed], components: [row] })
    }
  }

  // Interações com Select Menu
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "ticket_select") {
      const category = interaction.values[0]
      const userId = interaction.user.id

      console.log(`🎫 Criando ticket para categoria: ${category}`)

      // Verificar ticket existente
      const existingTicket = Array.from(activeTickets.values()).find((ticket) => ticket.userId === userId)
      if (existingTicket) {
        return interaction.reply({
          content: `❌ Você já tem um ticket: <#${existingTicket.channelId}>`,
          flags: MessageFlags.Ephemeral,
        })
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral })

      try {
        // Verificar se a configuração existe
        if (!config.TICKET_CATEGORIES || !config.TICKET_CATEGORIES[category]) {
          console.error(`❌ Categoria não encontrada: ${category}`)
          return interaction.editReply({ content: "❌ Erro: Categoria de ticket não configurada!" })
        }

        const ticketInfo = config.TICKET_CATEGORIES[category]
        console.log(`📋 Informações do ticket:`, ticketInfo)

        // Configurar permissões básicas do canal
        const permissionOverwrites = [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ]

        // Adicionar permissões de staff apenas se o ID for válido
        if (config.STAFF_ROLE_ID && config.STAFF_ROLE_ID.trim() !== "") {
          try {
            // Verificar se o cargo existe
            const staffRole = await interaction.guild.roles.fetch(config.STAFF_ROLE_ID)
            if (staffRole) {
              permissionOverwrites.push({
                id: config.STAFF_ROLE_ID,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory,
                ],
              })
              console.log(`✅ Permissões de staff adicionadas para: ${staffRole.name}`)
            }
          } catch (error) {
            console.log(`⚠️ Cargo de staff não encontrado: ${config.STAFF_ROLE_ID}`)
          }
        }

        // Criar canal
        const ticketChannel = await interaction.guild.channels.create({
          name: `${ticketInfo.emoji}-${ticketInfo.name}-${interaction.user.username}`.toLowerCase(),
          type: ChannelType.GuildText,
          parent: config.TICKET_CATEGORY_ID || null,
          permissionOverwrites: permissionOverwrites,
        })

        console.log(`✅ Canal criado: ${ticketChannel.name} (${ticketChannel.id})`)

        // Embed boas-vindas personalizada
        const welcomeEmbed = new EmbedBuilder()
          .setTitle(`Ticket Criado - ${ticketInfo.title} ${ticketInfo.emoji}`)
          .setDescription(
            `Olá <@${interaction.user.id}>!\n\n` +
              `Seja muito bem-vindo(a) ao seu ticket! Nossa equipe estará aqui para te ajudar da melhor forma possível.\n\n` +
              `Por favor, descreva detalhadamente sua solicitação para que possamos te atender rapidamente.`,
          )
          .setColor("#000000")
          .setThumbnail(interaction.user.displayAvatarURL())
          .addFields([
            { name: "📋 Categoria", value: ticketInfo.title, inline: true },
            { name: "📅 Criado em", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
            { name: "🆔 ID do Ticket", value: ticketChannel.id, inline: true },
          ])
          .setFooter({
            text: "Sistema de Tickets • Use os botões abaixo para gerenciar",
            iconURL: interaction.guild.iconURL(),
          })
          .setTimestamp()

        // Botões organizados exatamente como na imagem
        // Linha 1: Fechar ticket e Assumir ticket (lado a lado)
        const row1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("Fechar ticket")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("claim_ticket")
            .setLabel("Assumir ticket")
            .setEmoji("👑")
            .setStyle(ButtonStyle.Secondary),
        )

        // Linha 2: Adicionar membro ao ticket (botão largo)
        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("add_member")
            .setLabel("Adicionar membro ao ticket")
            .setEmoji("➕")
            .setStyle(ButtonStyle.Secondary),
        )

        // Linha 3: Remover membro do ticket (botão largo)
        const row3 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("remove_member")
            .setLabel("Remover membro do ticket")
            .setEmoji("➖")
            .setStyle(ButtonStyle.Secondary),
        )

        // Linha 4: Avisar membro (botão largo)
        const row4 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("notify_member")
            .setLabel("Avisar membro")
            .setEmoji("🔔")
            .setStyle(ButtonStyle.Secondary),
        )

        // Linha 5: Renomear Ticket (botão largo)
        const row5 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("rename_ticket")
            .setLabel("Renomear Ticket")
            .setEmoji("🏷️")
            .setStyle(ButtonStyle.Secondary),
        )

        console.log(`📤 Enviando mensagem de boas-vindas...`)

        // Enviar mensagem no canal do ticket
        await ticketChannel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [welcomeEmbed],
          components: [row1, row2, row3, row4, row5],
        })

        console.log(`✅ Mensagem enviada com sucesso!`)

        // Salvar ticket
        activeTickets.set(ticketChannel.id, {
          userId: interaction.user.id,
          channelId: ticketChannel.id,
          category: category,
          createdAt: Date.now(),
        })

        await interaction.editReply({
          content: `✅ Ticket criado com sucesso! Acesse: <#${ticketChannel.id}>`,
        })

        console.log(`🎫 Ticket criado com sucesso para ${interaction.user.username}`)
      } catch (error) {
        console.error("❌ Erro ao criar ticket:", error)
        await interaction.editReply({
          content: `❌ Erro ao criar ticket: ${error.message}`,
        })
      }
    }
  }

  // Resto das interações (botões, modals, etc.)
  if (!interaction.isButton() && !interaction.isModalSubmit()) return

  // Fechar ticket
  if (interaction.customId === "close_ticket") {
    await interaction.reply({ content: "🔒 Fechando ticket em 10 segundos...", flags: MessageFlags.Ephemeral })

    // Coletar mensagens do canal antes de fechar
    const messages = []
    try {
      const channelMessages = await interaction.channel.messages.fetch({ limit: 100 })
      channelMessages.reverse().forEach((msg) => {
        if (!msg.author.bot || msg.embeds.length > 0) {
          messages.push({
            author: msg.author.username,
            authorId: msg.author.id,
            content: msg.content,
            timestamp: msg.createdAt.toISOString(),
            embeds: msg.embeds.map((embed) => embed.title || embed.description).filter(Boolean),
          })
        }
      })
    } catch (error) {
      console.log("⚠️ Erro ao coletar mensagens:", error.message)
    }

    // Contagem regressiva
    let countdown = 10
    const countdownMessage = await interaction.channel.send(`⏰ **Ticket será fechado em ${countdown} segundos...**`)

    const countdownInterval = setInterval(async () => {
      countdown--
      if (countdown > 0) {
        await countdownMessage.edit(`⏰ **Ticket será fechado em ${countdown} segundos...**`)
      } else {
        clearInterval(countdownInterval)
        await countdownMessage.edit("🔒 **Fechando ticket agora...**")

        // Salvar transcript
        const ticketInfo = activeTickets.get(interaction.channel.id)
        if (ticketInfo) {
          // Adicionar username ao ticketInfo se não existir
          if (!ticketInfo.username) {
            try {
              const user = await interaction.guild.members.fetch(ticketInfo.userId)
              ticketInfo.username = user.user.username
            } catch (error) {
              ticketInfo.username = "Usuário Desconhecido"
            }
          }

          saveTranscript(ticketInfo, interaction.channel.id, interaction.channel.name, messages)
        }

        // Remover ticket da lista e deletar canal
        activeTickets.delete(interaction.channel.id)
        setTimeout(async () => {
          await interaction.channel.delete()
        }, 1000)
      }
    }, 1000)
  }

  // Assumir ticket
  if (interaction.customId === "claim_ticket") {
    const ticketInfo = activeTickets.get(interaction.channel.id)
    if (ticketInfo?.claimedBy) {
      return interaction.reply({
        content: `❌ Este ticket já foi assumido por <@${ticketInfo.claimedBy}>!`,
        flags: MessageFlags.Ephemeral,
      })
    }

    if (ticketInfo) {
      ticketInfo.claimedBy = interaction.user.id
      activeTickets.set(interaction.channel.id, ticketInfo)
    }

    const embed = new EmbedBuilder()
      .setTitle("👑 Ticket Assumido")
      .setDescription(`**${interaction.user.displayName}** assumiu este ticket!`)
      .setColor("#ffd700")
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  // Adicionar membro
  if (interaction.customId === "add_member") {
    const ticketInfo = activeTickets.get(interaction.channel.id)
    const isStaff = config.STAFF_ROLE_ID ? interaction.member.roles.cache.has(config.STAFF_ROLE_ID) : false
    const isOwner = ticketInfo && ticketInfo.userId === interaction.user.id
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator)

    if (!isStaff && !isOwner && !isAdmin) {
      return interaction.reply({
        content: "❌ Você não tem permissão para adicionar membros a este ticket!",
        flags: MessageFlags.Ephemeral,
      })
    }

    const modal = new ModalBuilder().setCustomId("add_member_modal").setTitle("➕ Adicionar Membro ao Ticket")

    const userIdInput = new TextInputBuilder()
      .setCustomId("user_id_input")
      .setLabel("ID do Usuário")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Cole o ID do usuário aqui...")
      .setRequired(true)
      .setMaxLength(20)

    const reasonInput = new TextInputBuilder()
      .setCustomId("reason_input")
      .setLabel("Motivo para adicionar")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Explique por que está adicionando este usuário ao ticket...")
      .setRequired(true)
      .setMaxLength(500)

    modal.addComponents(
      new ActionRowBuilder().addComponents(userIdInput),
      new ActionRowBuilder().addComponents(reasonInput),
    )

    await interaction.showModal(modal)
  }

  // Remover membro
  if (interaction.customId === "remove_member") {
    const isStaff = config.STAFF_ROLE_ID ? interaction.member.roles.cache.has(config.STAFF_ROLE_ID) : false
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator)

    if (!isStaff && !isAdmin) {
      return interaction.reply({
        content: "❌ Apenas staff pode remover membros deste ticket!",
        flags: MessageFlags.Ephemeral,
      })
    }

    const modal = new ModalBuilder().setCustomId("remove_member_modal").setTitle("➖ Remover Membro do Ticket")

    const userIdInput = new TextInputBuilder()
      .setCustomId("remove_user_id_input")
      .setLabel("ID do Usuário para Remover")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Cole o ID do usuário que deseja remover...")
      .setRequired(true)
      .setMaxLength(20)

    modal.addComponents(new ActionRowBuilder().addComponents(userIdInput))

    await interaction.showModal(modal)
  }

  // Avisar membro
  if (interaction.customId === "notify_member") {
    const ticketInfo = activeTickets.get(interaction.channel.id)
    if (!ticketInfo)
      return interaction.reply({ content: "❌ Erro: Ticket não encontrado!", flags: MessageFlags.Ephemeral })

    const embed = new EmbedBuilder()
      .setTitle("🔔 Notificação do Ticket")
      .setDescription(`<@${ticketInfo.userId}>, você tem uma nova mensagem no seu ticket!`)
      .setColor("#00bfff")
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  // Renomear ticket
  if (interaction.customId === "rename_ticket") {
    const isStaff = config.STAFF_ROLE_ID ? interaction.member.roles.cache.has(config.STAFF_ROLE_ID) : false
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator)

    if (!isStaff && !isAdmin) {
      return interaction.reply({
        content: "❌ Apenas staff pode renomear tickets!",
        flags: MessageFlags.Ephemeral,
      })
    }

    const modal = new ModalBuilder().setCustomId("rename_ticket_modal").setTitle("🏷️ Renomear Ticket")

    const nameInput = new TextInputBuilder()
      .setCustomId("new_name_input")
      .setLabel("Novo Nome do Ticket")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Digite o novo nome (sem espaços, use hífens)...")
      .setRequired(true)
      .setMaxLength(100)

    modal.addComponents(new ActionRowBuilder().addComponents(nameInput))

    await interaction.showModal(modal)
  }

  // Modal adicionar membro
  if (interaction.isModalSubmit() && interaction.customId === "add_member_modal") {
    const userId = interaction.fields.getTextInputValue("user_id_input")
    const reason = interaction.fields.getTextInputValue("reason_input")

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    try {
      const member = await interaction.guild.members.fetch(userId).catch(() => null)
      if (!member) {
        return interaction.editReply({ content: "❌ Usuário não encontrado! Verifique se o ID está correto." })
      }

      const hasAccess = interaction.channel.permissionsFor(member).has(PermissionFlagsBits.ViewChannel)
      if (hasAccess) {
        return interaction.editReply({ content: `❌ O usuário **${member.displayName}** já tem acesso a este ticket!` })
      }

      await interaction.channel.permissionOverwrites.create(member.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      })

      const embed = new EmbedBuilder()
        .setTitle("➕ Membro Adicionado ao Ticket")
        .setDescription(`**${member.displayName}** foi adicionado ao ticket com sucesso!`)
        .addFields([
          { name: "👤 Usuário Adicionado", value: `<@${member.id}>`, inline: true },
          { name: "👮 Adicionado por", value: `<@${interaction.user.id}>`, inline: true },
          { name: "📝 Motivo", value: reason, inline: false },
        ])
        .setColor("#00ff00")
        .setThumbnail(member.displayAvatarURL())
        .setTimestamp()

      await interaction.channel.send({ embeds: [embed] })
      await interaction.editReply({ content: `✅ **${member.displayName}** foi adicionado ao ticket com sucesso!` })
    } catch (error) {
      await interaction.editReply({ content: "❌ Erro ao adicionar membro ao ticket. Tente novamente." })
    }
  }

  // Modal remover membro
  if (interaction.isModalSubmit() && interaction.customId === "remove_member_modal") {
    const userId = interaction.fields.getTextInputValue("remove_user_id_input")

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    try {
      const member = await interaction.guild.members.fetch(userId).catch(() => null)
      if (!member) {
        return interaction.editReply({ content: "❌ Usuário não encontrado! Verifique se o ID está correto." })
      }

      const hasAccess = interaction.channel.permissionsFor(member).has(PermissionFlagsBits.ViewChannel)
      if (!hasAccess) {
        return interaction.editReply({
          content: `❌ O usuário **${member.displayName}** não tem acesso a este ticket!`,
        })
      }

      await interaction.channel.permissionOverwrites.delete(member.id)

      const embed = new EmbedBuilder()
        .setTitle("➖ Membro Removido do Ticket")
        .setDescription(`**${member.displayName}** foi removido do ticket com sucesso!`)
        .addFields([
          { name: "👤 Usuário Removido", value: `<@${member.id}>`, inline: true },
          { name: "👮 Removido por", value: `<@${interaction.user.id}>`, inline: true },
        ])
        .setColor("#ff0000")
        .setThumbnail(member.displayAvatarURL())
        .setTimestamp()

      await interaction.channel.send({ embeds: [embed] })
      await interaction.editReply({ content: `✅ **${member.displayName}** foi removido do ticket com sucesso!` })
    } catch (error) {
      await interaction.editReply({ content: "❌ Erro ao remover membro do ticket. Tente novamente." })
    }
  }

  // Modal renomear ticket
  if (interaction.isModalSubmit() && interaction.customId === "rename_ticket_modal") {
    const newName = interaction.fields.getTextInputValue("new_name_input").toLowerCase().replace(/\s+/g, "-")

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    if (newName.length < 1 || newName.length > 100) {
      return interaction.editReply({ content: "❌ Nome inválido! Use entre 1 e 100 caracteres." })
    }

    try {
      const oldName = interaction.channel.name
      await interaction.channel.setName(newName)

      const embed = new EmbedBuilder()
        .setTitle("🏷️ Ticket Renomeado")
        .setDescription(`Ticket renomeado com sucesso!`)
        .addFields([
          { name: "📝 Nome Anterior", value: oldName, inline: true },
          { name: "✨ Novo Nome", value: newName, inline: true },
          { name: "👮 Renomeado por", value: `<@${interaction.user.id}>`, inline: true },
        ])
        .setColor("#9932cc")
        .setTimestamp()

      await interaction.channel.send({ embeds: [embed] })
      await interaction.editReply({ content: `✅ Ticket renomeado para: **${newName}**` })
    } catch (error) {
      await interaction.editReply({ content: "❌ Erro ao renomear o ticket!" })
    }
  }
})

// Função para salvar transcript
function saveTranscript(ticketInfo, channelId, channelName, messages) {
  try {
    const fs = require("fs")
    const path = require("path")

    const transcriptsDir = path.join(__dirname, "transcripts")
    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir, { recursive: true })
    }

    const transcript = {
      channelId: channelId,
      channelName: channelName,
      username: ticketInfo.username || "Desconhecido",
      userId: ticketInfo.userId,
      category: ticketInfo.category,
      createdAt: new Date(ticketInfo.createdAt).toISOString(),
      closedAt: new Date().toISOString(),
      status: "Fechado",
      messages: messages,
    }

    const filename = `${channelId}-${Date.now()}.json`
    const filepath = path.join(transcriptsDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(transcript, null, 2))
    console.log(`📄 Transcript salvo: ${filename}`)
  } catch (error) {
    console.error("❌ Erro ao salvar transcript:", error)
  }
}

client.login(config.BOT_TOKEN)
