# 📋 Guia Completo de Setup

## 🎯 Passo a Passo

### 1. 📦 Preparação
\`\`\`bash
# Instalar dependências
npm install

# Executar configuração
npm run setup
\`\`\`

### 2. 🤖 Configuração do Bot Discord

#### Criar Aplicação:
1. Acesse: https://discord.com/developers/applications
2. Clique em **"New Application"**
3. Dê um nome ao bot

#### Configurar Bot:
1. Vá para aba **"Bot"**
2. Clique em **"Add Bot"**
3. Copie o **Token**
4. Cole no setup quando solicitado

#### Convidar Bot:
1. Vá para aba **"OAuth2" > "URL Generator"**
2. Marque: **bot**
3. Permissões: **Administrator**
4. Copie o link e convide para seu servidor

### 3. 🆔 Obter IDs do Discord

#### Ativar Modo Desenvolvedor:
1. Discord > Configurações > Avançado
2. Ative **"Modo Desenvolvedor"**

#### Copiar IDs:
- **Canal**: Botão direito > Copiar ID
- **Categoria**: Botão direito > Copiar ID  
- **Cargo**: Botão direito > Copiar ID

### 4. ⚙️ Configurações Recomendadas

#### Estrutura Sugerida:
\`\`\`
📁 TICKETS (Categoria)
├── 📢 painel-tickets (Canal do painel)
├── 📝 logs-tickets (Canal de logs)
└── 🎫 tickets criados aqui...
\`\`\`

#### Cargos Sugeridos:
- **@Staff** - Gerenciar tickets
- **@Admin** - Configurar bot

### 5. 🚀 Executar e Testar

\`\`\`bash
# Iniciar bot
npm start

# Testar comandos
!setup-tickets  # Criar painel
!auto-setup     # Setup automático
!help          # Ver comandos
\`\`\`

## ✅ Checklist Final

- [ ] Bot criado no Discord Developer Portal
- [ ] Token copiado e configurado
- [ ] Bot convidado para o servidor
- [ ] IDs coletados (canal, categoria, cargo)
- [ ] Configuração executada (\`npm run setup\`)
- [ ] Bot iniciado (\`npm start\`)
- [ ] Painel criado (\`!setup-tickets\`)
- [ ] Teste de criação de ticket

## 🆘 Problemas Comuns

### ❌ "Token inválido"
- Verifique se copiou o token completo
- Regenere o token se necessário

### ❌ "Permissões insuficientes"
- Convide o bot com permissões de Administrador
- Verifique se o cargo do bot está acima dos outros

### ❌ "Canal não encontrado"
- Verifique se os IDs estão corretos
- Certifique-se que o bot tem acesso aos canais

### ❌ "Arquivo config.js não encontrado"
- Execute \`npm run setup\` primeiro
- Verifique se o arquivo foi criado na pasta raiz
