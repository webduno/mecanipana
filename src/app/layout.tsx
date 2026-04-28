import type { Metadata } from "next";
import { MecanipanaBodyClass } from "@/components/mecanipana-body-class";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mecanipana — uso del auto",
  description:
    "Seguimiento del uso del vehículo en Venezuela (Fiat Siena 1.4 2008).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">
        <MecanipanaBodyClass />
        {children}
      </body>
    </html>
  );
}
