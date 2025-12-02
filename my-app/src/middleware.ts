import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLogged = !!req.auth;
  const path = req.nextUrl.pathname;

  const isProtectedPage =
    path.startsWith("/dashboard") ||
    path.startsWith("/(dashboard)");

  const isProtectedAPI =
    path.startsWith("/api/users");

  // Proteger páginas → redirect
  if (!isLogged && isProtectedPage) {
    return NextResponse.redirect(new URL("/(auth)/login", req.nextUrl));
  }

  // Proteger APIs → 401
  if (!isLogged && isProtectedAPI) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/(dashboard)/:path*",
    "/api/users/:path*"
  ]
};
