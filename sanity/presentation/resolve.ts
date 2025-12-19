import {
  defineLocations,
  PresentationPluginOptions,
} from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    // Add more locations for other post types
    blog: defineLocations({
      select: {
        title: "title",
        slug: "slug.current",
      },
      resolve: () => ({
        locations: [],
      }),
    }),
  },
};
