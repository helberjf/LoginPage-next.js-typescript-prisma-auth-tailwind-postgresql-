// src/app/(auth)/register/page.tsx
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Registrar</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
