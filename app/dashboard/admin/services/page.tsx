import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ServiceList from "@/components/admin/ServiceList";

export default async function ServicesPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Serviços</h1>
        <p className="text-gray-600">Gerenciar serviços da plataforma</p>
      </div>

      <ServiceList />
    </div>
  );
}
