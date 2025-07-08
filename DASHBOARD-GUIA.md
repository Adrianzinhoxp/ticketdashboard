# 🌐 Guia do Dashboard

## 🚀 Como Iniciar

### Método 1: Arquivo .bat (Windows)
1. Execute o arquivo `ABRIR-DASHBOARD.bat`
2. Aguarde a instalação das dependências
3. O dashboard será iniciado automaticamente

### Método 2: Terminal Manual
\`\`\`bash
# 1. Navegar para pasta do dashboard
cd dashboard

# 2. Instalar dependências (apenas na primeira vez)
npm install

# 3. Iniciar servidor
npm start
\`\`\`

### Método 3: Script de Desenvolvimento
\`\`\`bash
# Para desenvolvimento com auto-reload
npm run dev
\`\`\`

## 🌐 Acessar Dashboard

Após iniciar o servidor, abra no navegador:
- **URL:** http://localhost:3000
- **Porta:** 3000
- **Local:** Seu computador

## 📊 Funcionalidades

### 🔍 Busca e Filtros
- Buscar por usuário, categoria ou ID
- Filtrar por categoria específica
- Atualizar dados em tempo real

### 📈 Estatísticas
- Total de tickets
- Tickets criados hoje
- Última atualização

### 📄 Visualizar Transcripts
- Clique em qualquer ticket para ver detalhes
- Histórico completo de mensagens
- Informações do usuário e categoria

## ⚙️ Configurações

### Alterar Porta
Edite o arquivo `dashboard/server.js`:
\`\`\`javascript
const PORT = 3000 // Altere para outra porta
\`\`\`

### Personalizar Interface
Edite o arquivo `dashboard/public/style.css` para modificar:
- Cores
- Layout
- Fontes
- Animações

## 🔧 Solução de Problemas

### Erro "Porta em uso"
\`\`\`bash
# Parar processos na porta 3000
npx kill-port 3000

# Ou usar outra porta
PORT=3001 npm start
\`\`\`

### Erro "Módulos não encontrados"
\`\`\`bash
# Reinstalar dependências
rm -rf node_modules
npm install
\`\`\`

### Dashboard não carrega
1. Verifique se o servidor está rodando
2. Confirme a URL: http://localhost:3000
3. Verifique o console por erros

## 📱 Acesso Remoto

Para acessar de outros dispositivos na mesma rede:

1. Descubra seu IP local:
\`\`\`bash
ipconfig  # Windows
ifconfig  # Mac/Linux
\`\`\`

2. Acesse de outro dispositivo:
\`\`\`
http://SEU_IP:3000
\`\`\`

## 🛑 Parar o Dashboard

- **Terminal:** Pressione `Ctrl + C`
- **Arquivo .bat:** Feche a janela
- **Processo:** Use o gerenciador de tarefas
