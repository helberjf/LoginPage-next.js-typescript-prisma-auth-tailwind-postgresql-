"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const initialValues = useMemo(() => ({
    name: searchParams?.get("name") ?? "",
    email: searchParams?.get("email") ?? "",
    subject: searchParams?.get("subject") ?? "",
    message: searchParams?.get("message") ?? "",
  }), [searchParams]);

  const [formData, setFormData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Erro ao enviar mensagem");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      setError(message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Entre em Contato
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Estamos aqui para ajudar. Envie sua mensagem e responderemos o mais breve possível.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Contato */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Envie sua mensagem
          </h2>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Assunto
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Assunto da mensagem"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Mensagem
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Digite sua mensagem aqui..."
              />
            </div>

            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Mensagem enviada com sucesso! Em breve entraremos em contato.
              </div>
            )}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-70"
            >
              {loading ? "Enviando..." : "Enviar Mensagem"}
            </button>
          </form>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Informações de Contato</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    contato@sistema.com.br
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    suporte@sistema.com.br
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium">Telefone</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    (11) 1234-5678
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    (11) 98765-4321
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium">Endereço</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Av. Principal, 1234 - Centro<br />
                    São Paulo - SP<br />
                    CEP: 01234-567
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Horário de Atendimento
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div>Segunda a Sexta: 9h às 18h</div>
              <div>Sábado: 9h às 14h</div>
              <div>Domingo e Feriados: Fechado</div>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Redes Sociais
            </h3>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <div>Instagram: @sistema</div>
              <div>Facebook: /sistema</div>
              <div>LinkedIn: /company/sistema</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
