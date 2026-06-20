import type { Metadata } from "next";
import { Afacad, Geist_Mono } from "next/font/google";
import "./globals.css";

// Afacad carries both the expressive brand surface and the dense product UI.
// Geist Mono is reserved for measurements, status and compact metadata.
const sans = Afacad({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Green Spark AI | Our School, Clearly Seen",
  description:
    "A clear environmental view of our school, the cost behind its footprint, and the changes worth making next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-ink font-sans text-fg antialiased">
        {/* Fixed grain overlay: pointer-events-none, never on a scrolling layer. */}
        <div
          aria-hidden
          className="bg-noise pointer-events-none fixed inset-0 z-[60] opacity-[0.04] mix-blend-overlay"
        />
        {children}
      </body>
    </html>
  );
}
