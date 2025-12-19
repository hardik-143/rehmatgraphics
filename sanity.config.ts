import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { presentationTool } from "sanity/presentation";
import { schemaTypes } from "./sanity/schemas";
import seofields from "sanity-plugin-seofields";
import { media } from "sanity-plugin-media";
import { resolve } from "./sanity/presentation/resolve";
export default defineConfig({
  name: "default",
  title: "thehardik",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: "/studio",
  plugins: [
    structureTool(),
    visionTool(),
    media(),
    presentationTool({
      resolve,
      previewUrl: {
        // origin:
        //   (typeof window !== "undefined" && window.location.origin) ||
        //   "http://localhost:3000",
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    seofields({
      baseUrl: "https://thehardik.in",
    }),
  ],
  schema: {
    types: schemaTypes as any,
  },
});
