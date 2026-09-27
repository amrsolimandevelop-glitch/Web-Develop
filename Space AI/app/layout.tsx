import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space AI — Think beyond",
  description: "Your personal AI workspace for ideas, writing, learning, and building.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
