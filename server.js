const express = require("express")
const fs = require("fs")
const path = require("path")
const app = express()
const PORT = adrianzinhoxp.github.io/dashboardtickets

// Middleware
app.use(express.static("public"))
app.use(express.json())

// Rota principal
app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// API para listar transcripts
app.get("/api/transcripts", (req, res) => {
  try {
    const transcriptsDir = path.join(__dirname, "..", "transcripts")

    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir, { recursive: true })
      return res.json([])
    }

    const files = fs
      .readdirSync(transcriptsDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(transcriptsDir, file)
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
        return {
          id: file.replace(".json", ""),
          filename: file,
          ...data,
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json(files)
  } catch (error) {
    console.error("Erro ao listar transcripts:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// API para obter transcript específico
app.get("/api/transcript/:id", (req, res) => {
  try {
    const transcriptPath = path.join(__dirname, "..", "transcripts", `${req.params.id}.json`)

    if (!fs.existsSync(transcriptPath)) {
      return res.status(404).json({ error: "Transcript não encontrado" })
    }

    const data = JSON.parse(fs.readFileSync(transcriptPath, "utf8"))
    res.json(data)
  } catch (error) {
    console.error("Erro ao obter transcript:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Dashboard disponível em: https://adrianzinhoxp.github.io/dashboardtickets`)
  console.log(`📊 Acesse para visualizar os transcripts dos tickets`)
})
