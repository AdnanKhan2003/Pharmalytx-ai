import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import JsonLd from "@/components/seo/JsonLd";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pharmalytix-ai.vercel.app"),
  title: {
    default: "Pharmalytix AI | Intelligent Pharmacy Management",
    template: "%s | Pharmalytix AI"
  },
  description: "Secure, Efficient, and Intelligent Pharmacy Management. Powered by AI for demand forecasting, real-time inventory tracking, and secure POS operations.",
  keywords: ["pharmacy management", "AI forecasting", "inventory management", "pharmacy POS", "demand prediction", "healthcare AI"],
  icons: {
    icon: "/brand-logo.png",
  },
  openGraph: {
    title: "Pharmalytix AI - Smart Pharmacy Management",
    description: "Advanced Pharmacy Management System with AI-powered forecasting and secure role-based access control.",
    siteName: "Pharmalytix AI",
    url: "https://pharmalytix-ai.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pharmalytix AI Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pharmalytix AI - Smart Pharmacy",
    description: "Automate your pharmacy with AI-driven inventory and secure POS management.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <JsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
