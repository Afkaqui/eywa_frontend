import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import VisitTracker from "@/components/VisitTracker";
import "./globals.css";

// Tipografías de la marca (Dossier UNANCHA §1.5): Archivo para el logotipo y los
// titulares; IBM Plex Sans para la interfaz y los datos.
const archivo = Archivo({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-archivo", display: "swap" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "UNANCHA - Plataforma de Orquestación Ecosistémica y Sostenibilidad",
    template: "%s | UNANCHA",
  },
  description:
    "UNANCHA conecta y orquesta los ecosistemas de gobierno, empresas, inversores y sociedad civil a través de una plataforma inteligente de gestión de datos para impulsar la sostenibilidad medible.",
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
    "UNANCHA",
  ],
  authors: [{ name: "UNANCHA" }],
  creator: "UNANCHA",
  publisher: "UNANCHA",
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
    siteName: "UNANCHA",
    title: "UNANCHA - Plataforma de Orquestación Ecosistémica y Sostenibilidad",
    description:
      "Conectamos gobierno, empresas e inversores en un único flujo de trabajo colaborativo basado en datos verificables para impulsar decisiones sostenibles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UNANCHA - Plataforma de Sostenibilidad",
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
      name: "UNANCHA",
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
      name: "UNANCHA",
      inLanguage: "es",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "UNANCHA",
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
    <html lang="es" className={`${archivo.variable} ${plex.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Conteo propio de visitas (sin cookies ni datos personales). */}
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
        <SessionProvider>
          <AuthProvider>{children}</AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
