// src/app/(auth)/login/page.tsx
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Entrar</h1>
        <LoginForm />
      </div>
    </div>
  );
}
