class TicketDashboard {
  constructor() {
    this.tickets = []
    this.filteredTickets = []
    this.init()
  }

  async init() {
    this.setupEventListeners()
    await this.loadTickets()
    this.updateStats()
  }

  setupEventListeners() {
    // Busca
    document.getElementById("searchInput").addEventListener("input", () => {
      this.filterTickets()
    })

    // Filtro de categoria
    document.getElementById("categoryFilter").addEventListener("change", () => {
      this.filterTickets()
    })

    // Botão atualizar
    document.getElementById("refreshBtn").addEventListener("click", () => {
      this.loadTickets()
    })

    // Botão upload
    document.getElementById("uploadBtn").addEventListener("click", () => {
      document.getElementById("fileInput").click()
    })

    // Upload de arquivos
    const fileInput = document.getElementById("fileInput")
    const uploadArea = document.getElementById("uploadArea")

    fileInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files)
    })

    // Drag and drop
    uploadArea.addEventListener("click", () => {
      fileInput.click()
    })

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.classList.add("dragover")
    })

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover")
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.classList.remove("dragover")
      this.handleFiles(e.dataTransfer.files)
    })

    // Modal
    document.getElementById("closeModal").addEventListener("click", () => {
      this.closeModal()
    })

    // Fechar modal clicando fora
    document.getElementById("transcriptModal").addEventListener("click", (e) => {
      if (e.target.id === "transcriptModal") {
        this.closeModal()
      }
    })
  }

  async handleFiles(files) {
    const jsonFiles = Array.from(files).filter((file) => file.name.endsWith(".json"))

    if (jsonFiles.length === 0) {
      alert("Por favor, selecione apenas arquivos JSON.")
      return
    }

    try {
      const newTickets = []

      for (const file of jsonFiles) {
        const text = await this.readFileAsText(file)
        const data = JSON.parse(text)

        // Adicionar ID baseado no nome do arquivo
        data.id = file.name.replace(".json", "")
        data.filename = file.name

        newTickets.push(data)
      }

      // Adicionar novos tickets aos existentes
      this.tickets = [...this.tickets, ...newTickets]

      // Salvar no localStorage
      this.saveTicketsToStorage()

      // Atualizar interface
      this.filteredTickets = [...this.tickets]
      this.renderTickets()
      this.updateStats()

      alert(`${newTickets.length} transcript(s) carregado(s) com sucesso!`)
    } catch (error) {
      console.error("Erro ao processar arquivos:", error)
      alert("Erro ao processar os arquivos JSON. Verifique se são válidos.")
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  saveTicketsToStorage() {
    try {
      localStorage.setItem("ticketDashboard_tickets", JSON.stringify(this.tickets))
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error)
    }
  }

  loadTicketsFromStorage() {
    try {
      const stored = localStorage.getItem("ticketDashboard_tickets")
      if (stored) {
        this.tickets = JSON.parse(stored)
        return true
      }
    } catch (error) {
      console.error("Erro ao carregar do localStorage:", error)
    }
    return false
  }

  async loadTickets() {
    try {
      // Tentar carregar do localStorage primeiro
      if (this.loadTicketsFromStorage()) {
        this.filteredTickets = [...this.tickets]
        this.renderTickets()
        this.updateStats()
        return
      }

      // Se não houver dados salvos, mostrar área de upload
      this.showUploadPrompt()
    } catch (error) {
      console.error("Erro ao carregar tickets:", error)
      this.showError("Erro ao carregar os transcripts")
    }
  }

  showUploadPrompt() {
    const grid = document.getElementById("ticketsGrid")
    grid.innerHTML = `
      <div class="no-tickets">
        <i class="fas fa-upload fa-3x" style="margin-bottom: 20px; color: #3498db;"></i>
        <h3>Nenhum transcript encontrado</h3>
        <p>Faça upload dos seus arquivos JSON de transcript para começar.</p>
        <p style="margin-top: 10px; font-size: 0.9rem; color: #7f8c8d;">
          Arraste os arquivos para a área acima ou clique no botão "Upload JSON".
        </p>
      </div>
    `
  }

  filterTickets() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase()
    const categoryFilter = document.getElementById("categoryFilter").value

    this.filteredTickets = this.tickets.filter((ticket) => {
      const matchesSearch =
        !searchTerm ||
        ticket.username?.toLowerCase().includes(searchTerm) ||
        ticket.category?.toLowerCase().includes(searchTerm) ||
        ticket.channelId?.toLowerCase().includes(searchTerm)

      const matchesCategory = !categoryFilter || ticket.category === categoryFilter

      return matchesSearch && matchesCategory
    })

    this.renderTickets()
  }

  renderTickets() {
    const grid = document.getElementById("ticketsGrid")

    if (this.filteredTickets.length === 0 && this.tickets.length === 0) {
      this.showUploadPrompt()
      return
    }

    if (this.filteredTickets.length === 0) {
      grid.innerHTML = `
        <div class="no-tickets">
          <i class="fas fa-search fa-3x" style="margin-bottom: 20px; color: #bdc3c7;"></i>
          <h3>Nenhum resultado encontrado</h3>
          <p>Não há transcripts que correspondam aos filtros aplicados.</p>
        </div>
      `
      return
    }

    grid.innerHTML = this.filteredTickets.map((ticket) => this.createTicketCard(ticket)).join("")
  }

  createTicketCard(ticket) {
    const categoryClass = `category-${ticket.category}`
    const categoryName = this.getCategoryName(ticket.category)
    const messageCount = ticket.messages ? ticket.messages.length : 0
    const createdDate = new Date(ticket.createdAt).toLocaleDateString("pt-BR")
    const createdTime = new Date(ticket.createdAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    return `
      <div class="ticket-card" onclick="dashboard.openTicket('${ticket.id}')">
        <div class="ticket-header">
          <span class="ticket-id">#${ticket.channelId?.slice(-6) || ticket.id?.slice(-6) || "N/A"}</span>
          <span class="ticket-category ${categoryClass}">${categoryName}</span>
        </div>
        <div class="ticket-info">
          <p><strong>Usuário:</strong> ${ticket.username || "Desconhecido"}</p>
          <p><strong>Canal:</strong> ${ticket.channelName || "N/A"}</p>
          <p><strong>Status:</strong> ${ticket.status || "Fechado"}</p>
        </div>
        <div class="ticket-stats">
          <span class="message-count">
            <i class="fas fa-comments"></i>
            ${messageCount} mensagens
          </span>
          <span class="ticket-date">${createdDate} às ${createdTime}</span>
        </div>
      </div>
    `
  }

  getCategoryName(category) {
    const categories = {
      corregedoria: "Corregedoria",
      up_patente: "Up de Patente",
      duvidas: "Dúvidas",
    }
    return categories[category] || category || "Sem categoria"
  }

  openTicket(ticketId) {
    try {
      const ticket = this.tickets.find((t) => t.id === ticketId)

      if (!ticket) {
        this.showError("Ticket não encontrado")
        return
      }

      document.getElementById("modalTitle").textContent =
        `Ticket #${ticket.channelId?.slice(-6) || ticket.id?.slice(-6)} - ${this.getCategoryName(ticket.category)}`

      const modalBody = document.getElementById("modalBody")
      modalBody.innerHTML = this.renderTranscript(ticket)

      document.getElementById("transcriptModal").style.display = "block"
    } catch (error) {
      console.error("Erro ao abrir ticket:", error)
      this.showError("Erro ao carregar o transcript")
    }
  }

  renderTranscript(ticket) {
    let html = `
      <div class="ticket-details">
        <h3>Informações do Ticket</h3>
        <p><strong>Usuário:</strong> ${ticket.username || "Desconhecido"}</p>
        <p><strong>Canal:</strong> ${ticket.channelName || "N/A"}</p>
        <p><strong>Categoria:</strong> ${this.getCategoryName(ticket.category)}</p>
        <p><strong>Criado em:</strong> ${new Date(ticket.createdAt).toLocaleString("pt-BR")}</p>
        ${ticket.closedAt ? `<p><strong>Fechado em:</strong> ${new Date(ticket.closedAt).toLocaleString("pt-BR")}</p>` : ""}
      </div>
      <hr style="margin: 20px 0;">
      <h3>Mensagens</h3>
    `

    if (ticket.messages && ticket.messages.length > 0) {
      html += ticket.messages
        .map(
          (message) => `
            <div class="message">
              <div class="message-header">
                <span class="message-author">${message.author || "Usuário"}</span>
                <span class="message-time">${new Date(message.timestamp).toLocaleString("pt-BR")}</span>
              </div>
              <div class="message-content">${message.content || "<em>Mensagem sem conteúdo</em>"}</div>
            </div>
          `,
        )
        .join("")
    } else {
      html += "<p><em>Nenhuma mensagem encontrada neste ticket.</em></p>"
    }

    return html
  }

  closeModal() {
    document.getElementById("transcriptModal").style.display = "none"
  }

  updateStats() {
    const total = this.tickets.length
    const today = new Date().toDateString()
    const todayCount = this.tickets.filter((ticket) => new Date(ticket.createdAt).toDateString() === today).length

    document.getElementById("totalTickets").textContent = total
    document.getElementById("todayTickets").textContent = todayCount
    document.getElementById("lastUpdate").textContent = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  showError(message) {
    const grid = document.getElementById("ticketsGrid")
    grid.innerHTML = `
      <div class="no-tickets">
        <i class="fas fa-exclamation-triangle fa-3x" style="margin-bottom: 20px; color: #e74c3c;"></i>
        <h3>Erro</h3>
        <p>${message}</p>
      </div>
    `
  }
}

// Inicializar dashboard
const dashboard = new TicketDashboard()
