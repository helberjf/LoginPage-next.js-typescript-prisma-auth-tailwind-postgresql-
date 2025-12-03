"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: params.token,
        password,
      }),
    });

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-semibold">Redefinir senha</h1>

      {done ? (
        <p className="mt-4 text-green-600">Senha alterada com sucesso!</p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <input
            type="password"
            placeholder="Nova senha"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Alterar senha
          </button>
        </form>
      )}
    </div>
  );
}
