import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SanityLive } from "@/sanity/lib/live";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/app/components/DisableDraftMode";
import StoreProvider from "@/store/StoreProvider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "thehardik - Portfolio",
//   description: "Portfolio website of Hardik Desai",
//   other: {
//     "google-adsense-account": "ca-pub-9052794709394499",
//   },
// };

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL("https://thehardik.in"),
    title: {
      template: `%s | thehardik`,
      default: "thehardik",
    },
    icons: {
      icon: "/favicon.ico", // regular favicon
      shortcut: "/favicon.ico", // optional for shortcut icon
      apple: "/favicon.ico", // optional for Apple touch icon
    },
    description: "Portfolio website of Hardik Desai",
    other: {
      "google-adsense-account": "ca-pub-9052794709394499",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const draft = await draftMode();

  return (
    <html lang="en">
      <body
        // ${geistSans.variable} ${geistMono.variable}
        className={` ${montserrat.variable} antialiased font-sans-serif`}
      >
        <StoreProvider>{children}</StoreProvider>
        <SanityLive />
        {draft.isEnabled && (
          <>
            {/* Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
            <DisableDraftMode />
            <VisualEditing />
          </>
        )}
      </body>
    </html>
  );
}
