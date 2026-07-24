import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://eywa.encsust4in4ble.earth";

// Solo rutas PÚBLICAS (sin sesión). Las vistas de la aplicación viven detrás de
// login y no deben indexarse.
// `/empresa/[slug]` (mini-landings) y `/verificar/[codigo]` son dinámicas: se
// omiten a propósito porque dependen de datos; para incluirlas habría que listar
// los slugs públicos desde la API.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/fase1`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/infraestructura`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/verificar`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
