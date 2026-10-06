import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/** A precise sans lets the mascot supply the playfulness. */
const body = Geist({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Utility: on-chain values are ledger data and are set as ledger data. */
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Canonical origin for metadataBase, so OpenGraph images resolve to absolute
 * URLs. NEXT_PUBLIC_SITE_URL wins when set; otherwise Vercel supplies the
 * project's production domain (set even on preview deployments), which means a
 * correct link preview needs no dashboard configuration.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return `https://${vercelProduction.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();
const description =
  "Adopt a meme-community mascot. A little daily care grows your pet and brings your community's shared habitat to life.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MemePet — adopt the meme, grow the community",
    template: "%s · MemePet",
  },
  description,
  applicationName: "MemePet",
  openGraph: {
    type: "website",
    siteName: "MemePet",
    title: "MemePet — adopt the meme, grow the community",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "MemePet — adopt the meme, grow the community",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
