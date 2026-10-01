import type { Metadata } from "next";
import "./globals.css";
import "./valley-theme.css";
import {LocaleProvider} from "./locale-provider";
import PixelEffects from "./pixel-effects";

export const metadata: Metadata = {
  title: "Stardew Farm Journal",
  description: "Your daily Stardew Valley companion. Plan the season, track Community Center bundles, and make room for the way you like to play.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><LocaleProvider>{children}<PixelEffects/></LocaleProvider></body>
    </html>
  );
}
