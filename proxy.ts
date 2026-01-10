import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLogged = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // não logado → login
  if (!isLogged && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // logado → dashboard
  if (isLogged && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
