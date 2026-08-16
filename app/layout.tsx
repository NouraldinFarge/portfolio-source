import type { Metadata, Viewport } from "next";
import "./globals.css";

const publicOrigin = "https://nouraldinfarge.github.io";

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f2f3e9",
};

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(publicOrigin),
    title: "Nouraldin Farge — Desktop & Local-First Software Engineer",
    description: "Three public Windows releases and one source-free engineering case study, with inspectable code, safety boundaries, and release evidence.",
    authors: [{ name: "Nouraldin Farge" }],
    creator: "Nouraldin Farge",
    keywords: ["software engineer", "Windows desktop", "local-first", "AI-assisted software development", "React", "Rust", "Tauri", "Electron", "SQLite", "release engineering"],
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.svg",
    },
    alternates: { canonical: publicOrigin },
    robots: { index: true, follow: true },
    openGraph: {
      title: "Nouraldin Farge — Software Engineer",
      description: "Desktop and local-first systems with proof at every boundary.",
      url: publicOrigin,
      siteName: "Nouraldin Farge",
      type: "website",
      images: [{ url: `${publicOrigin}/og-v2.png`, width: 1734, height: 907, alt: "Nouraldin Farge — Software Engineer · Desktop · Local-First · Evidence-Backed" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Nouraldin Farge — Software Engineer",
      description: "Desktop and local-first systems with proof at every boundary.",
      images: [`${publicOrigin}/og-v2.png`],
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
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
