import type { Metadata } from "next";
import { Orbitron, Inter, Noto_Sans_JP } from "next/font/google";
import { AdminProvider } from "@/lib/store";
import { AdminShell } from "@/components/AdminShell";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", weight: ["400", "500", "700", "800", "900"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoJp = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-jp", weight: ["400", "500", "700", "900"], display: "swap", preload: false });

export const metadata: Metadata = {
  title: "PBT Match — Admin",
  description: "PBT Match 運営管理画面（プロトタイプ）",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${orbitron.variable} ${inter.variable} ${notoJp.variable}`}>
      <body>
        <AdminProvider>
          <AdminShell>{children}</AdminShell>
        </AdminProvider>
      </body>
    </html>
  );
}
