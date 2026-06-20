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

// Resolve the canonical site URL so social-link previews work on the deployed
// site. On Vercel this is set automatically; locally it falls back to localhost.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const TITLE = "Green Spark AI | Our School, Clearly Seen";
const DESCRIPTION =
  "An environmental AI detective for a school's Eco Club. It turns the school's energy, water, waste, transport, and food numbers into a short, costed action plan.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    images: [
      {
        url: "/images/hanover-high-school.jpg",
        width: 1200,
        height: 630,
        alt: "Green Spark AI — a school's environmental view",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/hanover-high-school.jpg"],
  },
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
