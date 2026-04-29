import type { Metadata } from "next";
import { FloatingNav } from "@/components/floating-nav";
import { MecanipanaBodyClass } from "@/components/mecanipana-body-class";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mecanipana — uso del auto",
  description:
    "Seguimiento del uso del vehículo en Venezuela (Fiat Siena 1.4 2008).",
  icons: {
    icon: "/mecanipanalogo.ico",
    apple: "/mecanipanalogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="flex min-h-full flex-col pb-20">
        <MecanipanaBodyClass />
        {children}
        <FloatingNav />
      </body>
    </html>
  );
}
