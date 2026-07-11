import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/content/spec";
import { SHORT_NAME, SITE_DESCRIPTION } from "@/lib/seo";

/**
 * PWA web app manifest. Colors mirror the design tokens in app/globals.css and
 * the icons reuse the same brand mark as the favicon so installed/app surfaces
 * stay on-identity.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SHORT_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f3efe5",
    theme_color: "#f3efe5",
    icons: [
      { src: "/ainativeoffice-icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/ainativeoffice-icon-32.png", type: "image/png", sizes: "32x32", purpose: "any" },
      { src: "/ainativeoffice-apple-icon.png", type: "image/png", sizes: "180x180", purpose: "maskable" },
    ],
  };
}
