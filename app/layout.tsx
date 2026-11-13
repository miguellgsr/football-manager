import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FM Mate — elenco, transferências e táticas com IA",
  description: "Planeje seu elenco no Football Manager com sugestões de IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
