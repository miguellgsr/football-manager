import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FM Mate — elenco, transferências e táticas com IA",
  description: "Planeje seu elenco no Football Manager com sugestões de IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
