import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButtons from "@/components/ContactButtons";
import ChatWidget from "@/components/ChatWidget";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Korean Cars - Import Veturash nga Korea",
  description:
    "Importoni vetura te perdorura direkt nga Korea e Jugut me cmime te volitshme. Hyundai, Kia, Genesis dhe me shume.",
  keywords: "vetura, korea, import, hyundai, kia, genesis, auto, makina",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq">
      <body className="font-sans">
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ContactButtons />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
