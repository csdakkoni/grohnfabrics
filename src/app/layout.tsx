import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "Grohn Fabrics - Premium Textile & Home Decor",
    template: "%s | Grohn Fabrics"
  },
  description: "High quality fabrics, curtains, and home textiles. Shop premium materials from Turkey.",
  keywords: ["fabric", "textile", "curtain", "home decor", "pillow covers", "tablecloth"],
  authors: [{ name: "Grohn Fabrics" }],
  creator: "Grohn Fabrics",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "tr_TR",
    url: "https://grohnfabrics.com",
    siteName: "Grohn Fabrics",
    title: "Grohn Fabrics - Premium Textile & Home Decor",
    description: "High quality fabrics, curtains, and home textiles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grohn Fabrics",
    description: "Premium textile and home decor",
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
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
