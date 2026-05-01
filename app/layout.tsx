import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
// import { AuthProvider } from "./Provider";
import { Toaster } from "@/components/ui/sonner";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ระบบบริการโรงพยาบาลมหาวิทยาลัยพะเยา",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${prompt.className} antialiased`}>
        {children}
        <Toaster style={{ fontFamily: "var(--font-prompt)" }} />
      </body>
    </html>
  );
}
