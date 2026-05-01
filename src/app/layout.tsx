import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { PageTransition } from "@/components/ui/PageTransition";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/components/ui/SmokeToast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmokeSentry - IoT Smart Smoke & Fire Detector",
  description: "Detektor asap & api pintar yang langsung ngabarin kamu. Because Five Minutes Can Save Everything.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
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
      className={`${inter.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <Providers>
            <CustomCursor />
            <PageTransition>{children}</PageTransition>
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
