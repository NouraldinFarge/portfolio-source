import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "Nouraldin Farge — Desktop & Local-First Software Engineer",
    description: "Three public Windows releases and one source-free engineering case study, with inspectable code, safety boundaries, and release evidence.",
    authors: [{ name: "Nouraldin Farge" }],
    creator: "Nouraldin Farge",
    keywords: ["software engineer", "Windows desktop", "local-first", "React", "Rust", "Tauri", "Electron", "SQLite", "release engineering"],
    alternates: { canonical: origin },
    robots: { index: true, follow: true },
    openGraph: {
      title: "Nouraldin Farge — Software Engineer",
      description: "Desktop and local-first systems with proof at every boundary.",
      url: origin,
      siteName: "Nouraldin Farge",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "Nouraldin Farge — Desktop & Local-First Software Engineer" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Nouraldin Farge — Software Engineer",
      description: "Desktop and local-first systems with proof at every boundary.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Nouraldin Farge",
    jobTitle: "Software Engineer",
    url: "https://nouraldinfarge.github.io",
    email: "mailto:nouraldinfarge@gmail.com",
    sameAs: [
      "https://github.com/NouraldinFarge",
      "https://linkedin.com/in/nouraldin-farge",
    ],
    knowsAbout: ["Windows desktop software", "local-first systems", "Rust", "Tauri", "Electron", "React", "SQLite", "release engineering"],
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
