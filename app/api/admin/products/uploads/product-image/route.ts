import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_FILES = 6;
const MAX_SIZE = 3 * 1024 * 1024;

function getFolderByDate() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return { yyyy, mm };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // ✅ aceita 1 arquivo ou vários (file repeated)
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

    const allowed = ["image/png", "image/jpeg", "image/webp"];

    const { yyyy, mm } = getFolderByDate();

    // ✅ pasta organizada por data
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products",
      yyyy,
      mm
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          { error: "Formato inválido. Use PNG/JPG/WEBP." },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Arquivo muito grande (max 3MB)" },
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

      const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      await fs.writeFile(filepath, buffer);

      urls.push(`/uploads/products/${yyyy}/${mm}/${filename}`);
    }

    // compat: 1 file => {url}, multi => {urls}
    if (urls.length === 1) return NextResponse.json({ url: urls[0] });
    return NextResponse.json({ urls });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
