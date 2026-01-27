import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pharmalytx-ai-git-main-adnankhan2003s-projects.vercel.app"),
  title: "Pharmalytix AI",
  description: "Advanced Pharmacy Management System - Secure, Efficient, Intelligent Pharmacy Management with AI-powered forecasting, inventory management, and role-based access control.",
  icons: {
    icon: "/transparent-logo.png",
  },
  openGraph: {
    title: "Pharmalytix AI",
    description: "Advanced Pharmacy Management System - Secure, Efficient, Intelligent Pharmacy Management",
    siteName: "Pharmalytix AI",
    url: "https://pharmalytx-ai-git-main-adnankhan2003s-projects.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pharmalytix AI - User Roles & Feature Access",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pharmalytix AI",
    description: "Advanced Pharmacy Management System - Secure, Efficient, Intelligent Pharmacy Management",
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
