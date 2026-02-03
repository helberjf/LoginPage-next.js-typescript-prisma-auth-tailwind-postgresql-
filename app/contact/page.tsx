import { Suspense } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {
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
          <Suspense fallback={<div className="text-sm text-neutral-500">Carregando formulário...</div>}>
            <ContactForm />
          </Suspense>
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
