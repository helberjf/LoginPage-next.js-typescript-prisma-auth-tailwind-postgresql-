// app/schedules/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ScheduleForm = {
  name: string;
  email: string;
  phone: string;
  serviceId: string;
  date: Date | undefined;
  time: string;
};

const services = [
  { id: "consulta", name: "Consulta Médica", duration: "30 min", price: "R$ 150" },
  { id: "corte", name: "Corte de Cabelo", duration: "45 min", price: "R$ 35" },
  { id: "massagem", name: "Massagem Relaxante", duration: "60 min", price: "R$ 80" },
  { id: "limpeza", name: "Limpeza de Pele", duration: "90 min", price: "R$ 120" },
  { id: "manicure", name: "Manicure", duration: "60 min", price: "R$ 25" },
  { id: "outros", name: "Outros Serviços", duration: "Variável", price: "A consultar" },
];

export default function GuestSchedulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ScheduleForm>({
    name: "",
    email: "",
    phone: "",
    serviceId: "",
    date: undefined,
    time: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.serviceId || !formData.date || !formData.time) {
      toast.error("Todos os campos são obrigatórios");
      setLoading(false);
      return;
    }

    // Validação de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido");
      setLoading(false);
      return;
    }

    // Validação de telefone básica
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Telefone deve estar no formato (XX) XXXXX-XXXX");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/schedules/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          date: formData.date.toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        toast.success("Agendamento realizado com sucesso!", {
          description: "Redirecionando para confirmação...",
        });
        setTimeout(() => {
          router.push("/schedules/success");
        }, 2000);
      } else {
        const errorData = await res.json();
        toast.error("Erro no agendamento", {
          description: errorData.error || "Ocorreu um erro ao agendar. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar agendamento:", error);
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao servidor.",
      });
    } finally {
      setLoading(false);
    }
  };


  const selectedService = services.find(s => s.id === formData.serviceId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Agendar Atendimento
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Escolha o melhor horário para seu atendimento
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User className="w-4 h-4" />
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Seu nome completo"
                      className="h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="(11) 99999-9999"
                      pattern="\([0-9]{2}\)\s\d{4,5}-\d{4}"
                      className="h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                    className="h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="serviceId" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Serviço
                  </Label>
                  <select
                    id="serviceId"
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? (
                            format(formData.date, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="time" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4" />
                      Hora
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Agendando...
                    </div>
                  ) : (
                    "Confirmar Agendamento"
                  )}
                </Button>
              </form>
            </div>

            {/* Service Preview */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Resumo do Agendamento
              </h3>

              {selectedService ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      {selectedService.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedService.duration}
                      </span>
                      <span className="font-medium">{selectedService.price}</span>
                    </div>
                  </div>

                  {formData.date && formData.time && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Data e Hora Selecionados
                      </h4>
                      <p className="text-green-700 dark:text-green-300">
                        {format(formData.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {formData.time}
                      </p>
                    </div>
                  )}

                  {formData.name && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Cliente
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">{formData.name}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{formData.email}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{formData.phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um serviço para ver os detalhes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}