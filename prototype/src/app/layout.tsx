import type { Metadata, Viewport } from "next";
import { Orbitron, Inter, Noto_Sans_JP } from "next/font/google";
import { AppProvider } from "@/lib/store";
import { ProfileGate } from "@/components/ProfileGate";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "THE PICKLE BANG THEORY — Match",
  description: "PBT 公式マッチングサービス（プロトタイプ）",
};

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${orbitron.variable} ${inter.variable} ${notoJp.variable}`}>
      <body>
        <div className="flex min-h-dvh w-full justify-center bg-[#050509]">
          <div className="app-glow relative flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-bg">
            <AppProvider>
              <ProfileGate />
              {children}
            </AppProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
