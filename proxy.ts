// proxy.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLogged = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Bloqueia /dashboard sem login
  if (!isLogged && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redireciona logado do /login para /dashboard
  if (isLogged && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 🔐 Bloqueia /api/admin sem login (barreira básica)
  if (!isLogged && pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};