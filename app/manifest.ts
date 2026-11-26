import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Produksi Dapur",
    short_name: "Produksi",
    description: "Pencatatan produksi resep warung.",
    start_url: "/input",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#242628",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
