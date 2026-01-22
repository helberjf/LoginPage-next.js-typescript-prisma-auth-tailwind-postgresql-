import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ServiceForm from "@/components/admin/ServiceForm";

export default async function NewServicePage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Serviço</h1>
        <p className="text-gray-600">Criar um novo serviço</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ServiceForm />
      </div>
    </div>
  );
}
