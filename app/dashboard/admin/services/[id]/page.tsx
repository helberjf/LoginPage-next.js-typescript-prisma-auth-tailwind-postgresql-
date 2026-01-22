import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ServiceForm from "@/components/admin/ServiceForm";

type Props = {
  params: {
    id: string;
  };
};

export default async function EditServicePage({ params }: Props) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Serviço</h1>
        <p className="text-gray-600">Atualizar informações do serviço</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ServiceForm serviceId={params.id} />
      </div>
    </div>
  );
}
