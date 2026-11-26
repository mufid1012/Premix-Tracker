import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * PNG ikon aplikasi dari logo warung (public/logo.jpg) di atas latar putih.
 * Logo diperkecil ke 88% supaya teksnya tetap utuh saat ikon "maskable" dipotong bulat.
 */
export async function renderAppIcon(size: number) {
  const logo = await readFile(join(process.cwd(), "public/logo.jpg"));
  const src = `data:image/jpeg;base64,${logo.toString("base64")}`;
  const logoSize = Math.round(size * 0.88);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse hanya mengenal img biasa */}
      <img src={src} width={logoSize} height={logoSize} alt="" />
    </div>,
    { width: size, height: size }
  );
}
