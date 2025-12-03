"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    setSent(true);
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-semibold">Esqueci minha senha</h1>

      {sent ? (
        <p className="mt-4">Se o email existir, enviaremos um link.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Enviar link
          </button>
        </form>
      )}
    </div>
  );
}
