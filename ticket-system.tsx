"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Trophy, HelpCircle, Ticket, User, Clock } from "lucide-react"

export default function Component() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showTicketForm, setShowTicketForm] = useState(false)

  const categories = [
    {
      id: "corregedoria",
      name: "Corregedoria",
      emoji: "⚠️",
      icon: AlertTriangle,
      description: "Reportar problemas ou violações",
      color: "bg-red-500/10 text-red-500 border-red-500/20",
    },
    {
      id: "up-patente",
      name: "Up de patente",
      emoji: "🏆",
      icon: Trophy,
      description: "Solicitar promoção de cargo",
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    {
      id: "duvidas",
      name: "Dúvidas",
      emoji: "❓",
      icon: HelpCircle,
      description: "Tirar dúvidas gerais",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
  ]

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setShowTicketForm(true)
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setShowTicketForm(false)
  }

  if (showTicketForm && selectedCategory) {
    const category = categories.find((cat) => cat.id === selectedCategory)
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <Card className="bg-[#2f3136] border-[#40444b] text-white">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Ticket className="w-6 h-6 text-[#5865f2]" />
              <CardTitle className="text-xl">Ticket Criado</CardTitle>
            </div>
            <CardDescription className="text-[#b9bbbe]">Seu ticket foi criado com sucesso!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#36393f] rounded-lg p-4 border border-[#40444b]">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${category?.color}`}>{category?.emoji}</div>
                <div>
                  <h3 className="font-semibold">{category?.name}</h3>
                  <p className="text-sm text-[#b9bbbe]">{category?.description}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#b9bbbe]" />
                  <span className="text-[#b9bbbe]">Criado por:</span>
                  <Badge variant="secondary" className="bg-[#5865f2] text-white">
                    @usuario#1234
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#b9bbbe]" />
                  <span className="text-[#b9bbbe]">Data:</span>
                  <span>{new Date().toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#36393f] rounded-lg p-4 border border-[#40444b]">
              <h4 className="font-semibold mb-2 text-[#00d166]">✅ Próximos passos:</h4>
              <ul className="text-sm text-[#b9bbbe] space-y-1">
                <li>• Um membro da equipe será notificado</li>
                <li>• Aguarde uma resposta em até 24 horas</li>
                <li>• Mantenha este canal aberto para comunicação</li>
              </ul>
            </div>

            <Button onClick={resetForm} className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white">
              Criar Novo Ticket
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="bg-[#2f3136] border-[#40444b] text-white">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Ticket className="w-8 h-8 text-[#5865f2]" />
            <CardTitle className="text-2xl">Sistema de Tickets</CardTitle>
          </div>
          <CardDescription className="text-[#b9bbbe]">Selecione uma categoria para abrir seu ticket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#36393f] rounded-lg p-6 border border-[#40444b]">
            <h3 className="text-lg font-semibold text-center mb-6 text-[#ffffff]">📋 Escolha uma opção</h3>

            <div className="space-y-3">
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <Button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    variant="outline"
                    className="w-full h-auto p-4 bg-[#40444b] border-[#40444b] hover:bg-[#4f545c] text-white justify-start"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.emoji}</span>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-base">{category.name}</div>
                        <div className="text-sm text-[#b9bbbe] mt-1">{category.description}</div>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#b9bbbe]">
              💡 <strong>Dica:</strong> Escolha a categoria que melhor descreve sua solicitação
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
