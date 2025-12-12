import { SeoFields } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/sanityImage";
import { Metadata } from "next";
import { BASE_URL } from "../env";

const allowedOGTypes = ["website", "article", "book", "profile"] as const;
const allowedTwitterCards = [
  "summary",
  "summary_large_image",
  "app",
  "player",
] as const;
type TwitterCard = (typeof allowedTwitterCards)[number];

export const sanitizeOGType = (
  type?: string
): (typeof allowedOGTypes)[number] => {
  return allowedOGTypes.includes(type as any) ? (type as any) : "website";
};

export const sanitizeTwitterCard = (card?: string): TwitterCard | undefined => {
  return allowedTwitterCards.includes(card as any)
    ? (card as TwitterCard)
    : "summary";
};

/**
 * 🧠 Build SEO Metadata object from Sanity SEO data
 * @param data The Sanity SEO response
 * @param path (optional) relative path of current page — used to create full URL for og:url
 */
export function buildSEO(
  seo: SeoFields | null | undefined,
  path: string = ""
): Metadata {
  let ogImageURL = "";

  if (seo?.openGraph?.imageType === "url") {
    ogImageURL = seo?.openGraph?.imageUrl || "";
  } else if (seo?.openGraph?.image) {
    ogImageURL = urlFor(seo?.openGraph?.image)?.url() || "";
  }

  const fullUrl = `${BASE_URL}${path}`;

  const additionalMetadata: Record<string, string> = {};
  if (seo?.metaAttributes && Array.isArray(seo.metaAttributes)) {
    seo.metaAttributes.forEach((attr) => {
      if (attr.key && attr.value) {
        additionalMetadata[attr.key] = attr.value;
      }
    });
  }
  return {
    title: seo?.title || "Blog - thehardik",
    description: seo?.description || "Blog - thehardik",  
    keywords: seo?.keywords || [],
    robots: {
      index: !seo?.robots?.noIndex,
      follow: !seo?.robots?.noFollow,
    },
    other: additionalMetadata,
    openGraph: {
      type: sanitizeOGType(seo?.openGraph?.type),
      url: seo?.openGraph?.url || fullUrl,
      title: seo?.openGraph?.title || "Blog - thehardik",
      description: seo?.openGraph?.description || "Blog - thehardik",
      siteName: seo?.openGraph?.siteName || "Blog - thehardik",
      images: ogImageURL ? [{ url: ogImageURL }] : [],
    },
    twitter: {
      card: sanitizeTwitterCard(seo?.twitter?.card),
      description: seo?.twitter?.description || "Blog - thehardik",
      site: seo?.twitter?.site || "@__thehardik",
      creator: seo?.twitter?.creator || "@__thehardik",
      title: seo?.twitter?.title || "Blog - thehardik",
      images: [
        seo?.twitter?.image
          ? urlFor(seo?.twitter?.image)?.url()
          : "https://example.com/og.png",
      ].filter(Boolean) as string[],
    },
  };
}
