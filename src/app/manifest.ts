import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UNANCHA - Plataforma de Orquestación Ecosistémica",
    short_name: "UNANCHA",
    description:
      "Plataforma inteligente de gestión de datos para impulsar la sostenibilidad medible.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F7F5",
    theme_color: "#2B1A10",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
