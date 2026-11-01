import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jonas Haahr · Data & BI",
  description: "Data generalist with a business head who turns messy data into decisions people can act on. MSc Business Intelligence (Aarhus University). Projects across data engineering, BI, analytics, and AI.",
  keywords: ["Business Intelligence", "Data Engineering", "Data Analytics", "Power BI", "SQL", "Python", "Azure", "Portfolio"],
  authors: [{ name: "Jonas Haahr" }],
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
    shortcut: '/logo.jpg',
  },
  openGraph: {
    title: "Jonas Haahr · Data & BI",
    description: "Data generalist with a business head who turns messy data into decisions people can act on.",
    url: "https://nordicravensolutions.com",
    siteName: "Jonas Haahr",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",   // let content under the notch; enables env(safe-area-inset-*)
  themeColor: "#0f172a",  // matches the always-dark background / page top
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
