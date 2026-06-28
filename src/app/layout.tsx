import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EYWA - Plataforma de Orquestación Ecosistémica y Sostenibilidad",
    template: "%s | EYWA",
  },
  description:
    "EYWA conecta y orquesta los ecosistemas de gobierno, empresas, inversores y sociedad civil a través de una plataforma inteligente de gestión de datos para impulsar la sostenibilidad medible.",
  keywords: [
    "sostenibilidad",
    "ESG",
    "orquestación ecosistémica",
    "gestión de datos",
    "carbono",
    "certificación orgánica",
    "inversión sostenible",
    "plataforma ESG",
    "reporting ESG",
    "huella de carbono",
    "economía circular",
    "deep tech",
    "sustainability platform",
    "EYWA",
  ],
  authors: [{ name: "EYWA Platform" }],
  creator: "EYWA",
  publisher: "EYWA Platform",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://eywa-hazel.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "EYWA",
    title: "EYWA - Plataforma de Orquestación Ecosistémica y Sostenibilidad",
    description:
      "Conectamos gobierno, empresas e inversores en un único flujo de trabajo colaborativo basado en datos verificables para impulsar decisiones sostenibles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EYWA - Plataforma de Sostenibilidad",
    description:
      "Orquestación de ecosistemas a través de datos inteligentes para la sostenibilidad medible.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "TU_CODIGO_DE_VERIFICACION_GOOGLE",
  },
  category: "technology",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eywa-hazel.vercel.app";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "EYWA",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description:
        "Plataforma de orquestación ecosistémica que conecta gobierno, empresas, inversores y sociedad civil a través de la gestión inteligente de datos para impulsar la sostenibilidad medible.",
      slogan: "Orquestando ecosistemas a través de datos",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "EYWA",
      inLanguage: "es",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "EYWA",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description:
        "Plataforma SaaS de gestión de datos ESG y sostenibilidad: diagnóstico ESG, portfolio de inversión sostenible, simbiocreación y reporting verificable.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SessionProvider>
          <AuthProvider>{children}</AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
