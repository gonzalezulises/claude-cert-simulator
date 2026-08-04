import type { Metadata } from "next";
import "./globals.css";
import version from "../../version.json";

/* Debe coincidir con `basePath` en next.config.ts: la exportación estática se
   sirve bajo esa ruta en GitHub Pages y <script src> no se prefija solo. */
const BASE = "/claude-cert-simulator";

export const metadata: Metadata = {
  title: "Claude Certified Architect — Simulador",
  description:
    "Simulador de la certificación Claude Certified Architect – Foundations de Anthropic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="curso-version" content={version.version} />
        <meta name="curso-actualizado" content={version.actualizado} />
        {/* Síncrono y a propósito: fija el tema antes del primer pintado. */}
        <script src={`${BASE}/tema.js`} />
      </head>
      <body className="antialiased" data-version={version.version}>
        {children}
      </body>
    </html>
  );
}
