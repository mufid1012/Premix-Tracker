import { renderAppIcon } from "@/lib/appIcon";

// /icon/32 untuk tab browser; /icon/192 dan /icon/512 dipakai manifest PWA
export function generateImageMetadata() {
  return [32, 192, 512].map((px) => ({
    id: String(px),
    size: { width: px, height: px },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  return renderAppIcon(Number(await id));
}
