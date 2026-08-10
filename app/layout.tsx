import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { SettingsProvider } from "@/lib/context/SettingsContext";
import { LocationProvider } from "@/lib/context/LocationContext";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "ShelfSense";
const APP_DEFAULT_TITLE =
  "ShelfSense ERP - Phone Spare Parts Distribution & Inventory Management";
const APP_DESCRIPTION =
  "Enterprise-grade multi-hub inventory, POS, purchasing, and sales fulfillment system.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo/logo_black.png", type: "image/png", sizes: "500x500" },
    ],
    apple: [{ url: "/logo/logo_black.png", type: "image/png", sizes: "500x500" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LocationProvider>
            <SettingsProvider>
              {children}
              <InstallPrompt />
            </SettingsProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
