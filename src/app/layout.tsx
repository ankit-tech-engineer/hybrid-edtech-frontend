import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import CustomLoader from "@/components/CustomLoader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HybridTutor Marketplace",
  description: "Find the best tutors for online and offline learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <CustomLoader />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
