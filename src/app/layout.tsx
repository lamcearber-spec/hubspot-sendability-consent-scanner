import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sendability Consent Scanner for HubSpot",
  description: "Read-only HubSpot consent, subscription, and deliverability scan for blocked marketing contacts.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
