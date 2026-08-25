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
    title: "Nouraldin Farge — React & TypeScript Software Engineer",
    description: "React and TypeScript product engineering across frontend, full-stack, and local-first Windows software, supported by inspectable release evidence.",
    authors: [{ name: "Nouraldin Farge" }],
    creator: "Nouraldin Farge",
    keywords: ["software engineer", "React", "TypeScript", "frontend engineer", "full-stack engineer", "product engineer", "Windows desktop", "local-first", "Rust", "Tauri", "Electron", "SQLite", "release engineering"],
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: "/favicon.svg",
    },
    alternates: { canonical: publicOrigin },
    robots: { index: true, follow: true },
    openGraph: {
      title: "Nouraldin Farge — React & TypeScript Software Engineer",
      description: "React and TypeScript products with proof from interface through release.",
      url: publicOrigin,
      siteName: "Nouraldin Farge",
      type: "website",
      images: [{ url: `${publicOrigin}/github-social-preview-software-engineer-v2.png`, width: 1280, height: 640, alt: "Nouraldin Farge — React and TypeScript Software Engineer · Local-First · Evidence-Backed" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Nouraldin Farge — React & TypeScript Software Engineer",
      description: "React and TypeScript products with proof from interface through release.",
      images: [`${publicOrigin}/github-social-preview-software-engineer-v2.png`],
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
    knowsAbout: ["React", "TypeScript", "frontend engineering", "full-stack product development", "Windows desktop software", "local-first systems", "Rust", "Tauri", "Electron", "SQLite", "release engineering"],
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
