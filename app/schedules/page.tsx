import type { Metadata } from "next";
import SchedulingFlow from "@/components/SchedulingFlow";

export const metadata: Metadata = {
  title: "Agendar Serviço | Apple Store",
  description: "Agende um serviço escolhendo data, horário e profissional disponível.",
};

export default function SchedulesPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <SchedulingFlow />
      </div>
    </main>
  );
}