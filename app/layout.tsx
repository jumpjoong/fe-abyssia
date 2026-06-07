import type { Metadata } from "next";
import { AppKitProvider } from "./context";

//나중에 ec2 배포 시 변경
const BASE_URL = "https://mining-game-omega.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "ABYSSIA",
    template: "%s | ABYSSIA",
  },

  description:
    "Mine rare deep-sea resources and exchange them for ABYSSIA tokens on BNB Chain. A Web3 mining game where the ocean depths meet digital value.",

  keywords: [
    "ABYSSIA",
    "crypto mining game",
    "BNB Chain",
    "Web3 game",
    "blockchain game",
    "deep sea mining",
    "ABYSSIA token",
    "play to earn",
  ],

  authors: [{ name: "ABYSSIA" }],
  creator: "ABYSSIA",
  publisher: "ABYSSIA",

  // ── Open Graph (SNS 공유) ──────────────────────
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "ABYSSIA",
    title: "ABYSSIA",
    description:
      "Mine rare deep-sea resources and exchange them for ABYSSIA tokens on BNB Chain.",
    images: [
      {
        url: "https://mining-game-omega.vercel.app/og-img.png",
        width: 1280,
        height: 640,
        alt: "ABYSSIA — From Ocean Depths to Digital Value",
      },
    ],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "ABYSSIA — From Ocean Depths to Digital Value",
    description:
      "Mine rare deep-sea resources and exchange them for ABYSSIA tokens on BNB Chain.",
    images: ["https://mining-game-omega.vercel.app/og-img.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppKitProvider>{children}</AppKitProvider>
      </body>
    </html>
  );
}
