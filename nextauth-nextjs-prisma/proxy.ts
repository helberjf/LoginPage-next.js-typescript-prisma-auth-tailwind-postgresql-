import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/api/users"];
const SESSION_COOKIE = "authjs.session-token";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  const session = req.cookies.get(SESSION_COOKIE)?.value;

  // Bloqueia e redireciona se precisa de login
  if (protectedPaths.some(p => path.startsWith(p)) && !session) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Continua
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|logo|fonts|.*\\..*).*)"
  ],
};
