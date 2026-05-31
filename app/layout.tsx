import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://oddskies.com"),
  title: "OddSkies | Strange reports, honestly mapped.",
  description:
    "OddSkies maps public, unverified reports by time, place, category, and source.",
  openGraph: {
    title: "OddSkies",
    description: "Strange reports, honestly mapped.",
    url: "https://oddskies.com",
    siteName: "OddSkies",
    images: [
      {
        url: "/images/oddskies-hero.png",
        width: 1718,
        height: 916,
        alt: "A strange twilight sky above a distant horizon.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
