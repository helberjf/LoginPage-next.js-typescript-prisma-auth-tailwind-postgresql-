// app/api/admin/services/uploads/service-image/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth/require-admin";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const MAX_FILES = 6;
const MAX_SIZE = 3 * 1024 * 1024;
const allowed = ["image/png", "image/jpeg", "image/webp"];

const USE_R2 = process.env.USE_R2 === "true";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
const R2_DIRECT_UPLOAD = process.env.R2_DIRECT_UPLOAD === "true";

const r2 = USE_R2
  ? new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

function getFolderByDate() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return { yyyy, mm };
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const formData = await req.formData();
    const filesRaw = formData.getAll("file");
    const files = filesRaw.filter((f): f is File => f instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Máximo de ${MAX_FILES} imagens por envio.` },
        { status: 400 }
      );
    }

    const { yyyy, mm } = getFolderByDate();

    if (USE_R2 && r2) {
      const uploads = await Promise.all(
        files.map(async (file) => {
          if (!allowed.includes(file.type)) {
            throw new Error("Formato inválido");
          }

          if (file.size > MAX_SIZE) {
            throw new Error("Arquivo muito grande");
          }

          const ext =
            file.type === "image/png"
              ? "png"
              : file.type === "image/webp"
              ? "webp"
              : "jpg";

          const filename = `${Date.now()}-${crypto
            .randomBytes(8)
            .toString("hex")}.${ext}`;

          const key = `services/${yyyy}/${mm}/${filename}`;

          const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key;

          if (R2_DIRECT_UPLOAD) {
            const buffer = Buffer.from(await file.arrayBuffer());
            await r2.send(
              new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: file.type,
              })
            );

            return { url: publicUrl, key };
          }

          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            ContentType: file.type,
          });

          const uploadUrl = await getSignedUrl(r2, command, {
            expiresIn: 60,
          });

          return {
            uploadUrl,
            key,
            publicUrl,
          };
        })
      );

      if (R2_DIRECT_UPLOAD) {
        const urls = uploads.map((item) => item.url as string);
        return urls.length === 1
          ? NextResponse.json({ mode: "r2", url: urls[0] })
          : NextResponse.json({ mode: "r2", urls });
      }

      return NextResponse.json({ mode: "r2", uploads });
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "services",
      yyyy,
      mm
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          { error: "Formato inválido" },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Arquivo muito grande" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const ext =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
          ? "webp"
          : "jpg";

      const filename = `${Date.now()}-${crypto
        .randomBytes(8)
        .toString("hex")}.${ext}`;

      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);

      urls.push(`/uploads/services/${yyyy}/${mm}/${filename}`);
    }

    return urls.length === 1
      ? NextResponse.json({ mode: "local", url: urls[0] })
      : NextResponse.json({ mode: "local", urls });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
