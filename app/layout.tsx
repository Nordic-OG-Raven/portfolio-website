import type { Metadata } from "next";
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
  title: "Nordic Raven Solutions - Portfolio",
  description: "AI-powered solutions for business intelligence and data analysis. Showcasing interactive projects including RAG systems, coding tutors, and data analytics.",
  keywords: ["AI", "Machine Learning", "Data Analysis", "RAG", "Portfolio"],
  authors: [{ name: "Nordic Raven Solutions" }],
  openGraph: {
    title: "Nordic Raven Solutions",
    description: "AI-powered solutions for business intelligence and data analysis",
    url: "https://nordicravensolutions.com",
    siteName: "Nordic Raven Solutions",
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
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
