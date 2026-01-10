import { auth } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Meu perfil</h1>
        <p className="text-sm text-neutral-500">
          Informações da sua conta
        </p>
      </header>

      <section className="border rounded-lg bg-white dark:bg-neutral-900 p-6 space-y-4">
        <div>
          <span className="block text-xs text-neutral-500">
            Nome
          </span>
          <span className="font-medium">
            {session.user.name ?? "Não informado"}
          </span>
        </div>

        <div>
          <span className="block text-xs text-neutral-500">
            Email
          </span>
          <span className="font-medium">
            {session.user.email}
          </span>
        </div>

        <div>
          <span className="block text-xs text-neutral-500">
            Tipo de conta
          </span>
          <span className="font-medium">
            {session.user.role}
          </span>
        </div>
      </section>

      <p className="text-xs text-neutral-500">
        Em breve você poderá editar seus dados de perfil.
      </p>
    </div>
  );
}
