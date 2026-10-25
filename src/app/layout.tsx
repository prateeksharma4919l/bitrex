import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BITREX — Digital assets, clearly managed",
  description: "A modern digital asset wallet with transparent demo mode.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
