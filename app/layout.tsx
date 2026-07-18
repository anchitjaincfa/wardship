import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wardship | Companion safety control plane",
  description: "A v0 safety review console for AI companion conversations."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
