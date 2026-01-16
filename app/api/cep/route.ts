// app/api/cep/route.ts
import { NextResponse } from "next/server";

type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cep = searchParams.get("cep")?.replace(/\D/g, "");

  if (!cep || !/^\d{8}$/.test(cep)) {
    return NextResponse.json(
      { error: "CEP inválido" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://viacep.com.br/ws/${cep}/json/`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro ao consultar CEP" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as ViaCepResponse;

    if (data.erro) {
      return NextResponse.json(
        { error: "CEP não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      zipCode: data.cep.replace(/\D/g, ""),
      street: data.logradouro,
      district: data.bairro,
      city: data.localidade,
      state: data.uf,
      complement: data.complemento || "",
      country: "BR",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao consultar CEP" },
      { status: 500 }
    );
  }
}
