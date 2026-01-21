// app/schedules/success/page.tsx
"use client";

import Link from "next/link";
import { CheckCircle, Calendar, Home, Phone, Mail } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ScheduleSuccessPage() {
  useEffect(() => {
    toast.success("Agendamento confirmado!", {
      description: "Seu agendamento foi registrado com sucesso.",
    });
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Agendamento Confirmado!
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Seu agendamento foi enviado com sucesso. Entraremos em contato em breve para confirmar os detalhes e orientações específicas.
        </p>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            O que acontece agora?
          </h3>
          <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Mail className="w-3 h-3" />
              </div>
              <span>Receberá um email de confirmação</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Phone className="w-3 h-3" />
              </div>
              <span>Ligaremos para confirmar o horário</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <Calendar className="w-3 h-3" />
              </div>
              <span>Agendamento adicionado ao sistema</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full justify-center"
          >
            <Calendar className="w-5 h-5" />
            Ver meus agendamentos
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200 w-full justify-center"
          >
            <Home className="w-5 h-5" />
            Voltar para a página inicial
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Em caso de dúvidas, entre em contato conosco.
        </p>
      </div>
    </div>
  );
}