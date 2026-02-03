import Link from "next/link";

type PageProps = {
  searchParams?:
    | Promise<{
        email?: string;
      }>
    | {
        email?: string;
      };
};

export default async function RegisterSuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const email = resolvedSearchParams?.email;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Conta criada!
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Enviamos um email de verificação. Confirme o email para poder fazer login.
        </p>
        {email ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/30 dark:text-neutral-200">
            {email}
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Ir para login
          </Link>
        </div>
      </div>
    </main>
  );
}
