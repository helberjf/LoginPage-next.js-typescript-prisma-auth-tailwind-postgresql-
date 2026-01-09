import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const session = await auth();

  // 🔒 Usuário JÁ autenticado
  if (session) {
    if (session.user?.role === "ADMIN") {
      redirect("/admin");
    }

    redirect("/dashboard");
  }

  // 👇 Usuário NÃO autenticado cai aqui
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Sign in to your account
        </h1>

        <LoginForm />

        <div className="mt-6 text-center text-sm space-y-2">
          <p>
            Forgot your password?{" "}
            <a href="/forgot-password" className="underline text-primary">
              Reset it
            </a>
          </p>

          <p>
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline text-primary">
              Create one
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
