// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    /**
     * 1️⃣ Rate limiting
     * Prevents brute-force attacks against the reset-password endpoint.
     * Must run BEFORE parsing the request body to reduce CPU usage.
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
          // Retry-After header follows HTTP best practices
          headers: rl.retryAfter
            ? { "Retry-After": String(rl.retryAfter) }
            : undefined,
        }
      );
    }

    /**
     * 2️⃣ Read and validate input
     * Token comes from the reset-password link (email).
     * Password is provided by the user.
     */
    const body = await req.json();
    const token = String(body?.token || "").trim();
    const password = String(body?.password || "").trim();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    /**
     * Basic password validation.
     * Stronger rules can be added later if needed.
     */
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    /**
     * 3️⃣ Fetch all valid reset tokens
     *
     * Tokens are stored hashed in the database, so we cannot query by token directly.
     * We must retrieve all non-expired RESET_PASSWORD tokens and compare hashes.
     *
     * This approach avoids storing raw tokens and prevents database leaks
     * from being used to reset accounts.
     */
    const records = await prisma.verificationToken.findMany({
      where: {
        type: "RESET_PASSWORD",
        expires: { gt: new Date() },
      },
    });

    // Early exit if no valid tokens exist
    if (records.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    /**
     * Try to find the matching token by comparing hashes.
     */
    let record = null;

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
     * 4️⃣ Load the user associated with this token
     * The email is stored in `identifier` when the token is created.
     */
    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });

    // Prevent password reset for invalid or OAuth-only users
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 400 }
      );
    }

    /**
     * 5️⃣ Update password and invalidate security artifacts
     *
     * - Update user password (hashed)
     * - Delete ALL reset tokens for this user (one-time use)
     * - Invalidate all active sessions (global logout)
     *
     * This is done in a single transaction to avoid partial updates.
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.deleteMany({
        where: {
          identifier: record.identifier,
          type: "RESET_PASSWORD",
        },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    /**
     * Generic error handler.
     * Internal errors are never exposed to the client.
     */
    console.error("reset-password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
