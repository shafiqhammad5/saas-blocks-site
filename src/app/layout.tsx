import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
  title: {
    default: "SaaSBlocks - Premium TailwindCSS UI Components for SaaS",
    template: "%s | SaaSBlocks"
  },
  description: "Discover premium TailwindCSS UI blocks and components designed specifically for SaaS applications. Build beautiful, responsive interfaces faster with our curated collection of reusable components.",
  keywords: ["TailwindCSS", "UI Components", "SaaS", "React", "Next.js", "UI Blocks", "Web Development", "Frontend"],
  authors: [{ name: "SaaSBlocks Team" }],
  creator: "SaaSBlocks",
  publisher: "SaaSBlocks",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "SaaSBlocks - Premium TailwindCSS UI Components for SaaS",
    description: "Discover premium TailwindCSS UI blocks and components designed specifically for SaaS applications. Build beautiful, responsive interfaces faster with our curated collection of reusable components.",
    siteName: "SaaSBlocks",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SaaSBlocks - Premium TailwindCSS UI Components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaSBlocks - Premium TailwindCSS UI Components for SaaS",
    description: "Discover premium TailwindCSS UI blocks and components designed specifically for SaaS applications.",
    images: ["/og-image.jpg"],
    creator: "@saasblocks",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SaaSBlocks",
              description: "Premium TailwindCSS UI Components for SaaS Applications",
              url: process.env.APP_URL || "http://localhost:3000",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.APP_URL || "http://localhost:3000"}/blocks?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
