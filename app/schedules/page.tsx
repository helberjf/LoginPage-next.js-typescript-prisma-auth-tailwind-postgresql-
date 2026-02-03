import type { Metadata } from "next";
import { Suspense } from "react";
import SchedulingFlow from "@/components/SchedulingFlow";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Agendar Serviço | Apple Store",
  description: "Agende um serviço escolhendo data, horário e profissional disponível.",
};

export default async function SchedulesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      accounts: { where: { provider: "google" }, select: { id: true } },
      profile: { select: { phone: true, cpf: true } },
    },
  });

  const isGoogleAccount = (user?.accounts?.length ?? 0) > 0;
  const prefill = isGoogleAccount
    ? {}
    : {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.profile?.phone ?? "",
        cpf: user?.profile?.cpf ?? "",
      };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Suspense fallback={<div className="min-h-[60vh]" />}> 
          <SchedulingFlow prefill={prefill} isGoogleAccount={isGoogleAccount} />
        </Suspense>
      </div>
    </main>
  );
}