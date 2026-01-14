// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    /**
     * 1️⃣ Rate limiting
     */
    const rl = rateLimit(req, {
      limit: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: rl.retryAfter
            ? { "Retry-After": String(rl.retryAfter) }
            : undefined,
        }
      );
    }

    /**
     * 2️⃣ Read and validate input
     */
    const body = await req.json();

    const token = String(body?.token || "").trim();
    const password = String(body?.password || "").trim();
    const email = String(body?.email || "").toLowerCase().trim();

    if (!token || !password || !email) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    /**
     * 3️⃣ Fetch valid RESET_PASSWORD tokens for THIS email only
     */
    const records = await prisma.verificationToken.findMany({
      where: {
        identifier: email,
        type: "RESET_PASSWORD",
        expires: { gt: new Date() },
      },
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    /**
     * 4️⃣ Compare hashed tokens
     */
    let record: typeof records[number] | null = null;

    for (const r of records) {
      if (await bcrypt.compare(token, r.token)) {
        record = r;
        break;
      }
    }

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    /**
     * 5️⃣ Load user
     */
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 400 }
      );
    }

    /**
     * 6️⃣ Secure transaction
     * - invalidate token FIRST
     * - update password
     * - logout all sessions
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.verificationToken.delete({
        where: { id: record!.id },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await tx.session.deleteMany({
        where: { userId: user.id },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
