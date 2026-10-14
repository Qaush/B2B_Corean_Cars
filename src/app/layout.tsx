import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButtons from "@/components/ContactButtons";
import ChatWidget from "@/components/ChatWidget";
import Providers from "@/components/Providers";
import { ExchangeRateProvider } from "@/components/ExchangeRateProvider";
import { getEurKrw } from "@/lib/exchange-rate";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DriveSphere - Import Veturash nga Korea",
  description:
    "Importoni vetura te perdorura direkt nga Korea e Jugut me cmime te volitshme. Hyundai, Kia, Genesis dhe me shume.",
  keywords: "vetura, korea, import, hyundai, kia, genesis, auto, makina",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const eurKrw = await getEurKrw();
  return (
    <html lang="sq" className={inter.variable}>
      <body className="font-sans">
        <Providers>
          <ExchangeRateProvider value={eurKrw}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ContactButtons />
          <ChatWidget />
          </ExchangeRateProvider>
        </Providers>
      </body>
    </html>
  );
}
