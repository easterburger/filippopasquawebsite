import type { Metadata, Viewport } from "next";
import { Inter_Tight, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";

import { SoundProvider } from "@/components/sound/SoundProvider";
import SoundToggle from "@/components/sound/SoundToggle";

import { PageTransitionProvider } from "./components/PageTransition";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-editorial",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const title = "Filippo Pasqua | Student & Software Developer";
const description =
  "Filippo Pasqua is an IB student and software developer from Italy.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} ${playfair.variable}`}>
        <SoundProvider>
          <PageTransitionProvider>{children}</PageTransitionProvider>
          <SoundToggle />
        </SoundProvider>
      </body>
    </html>
  );
}
