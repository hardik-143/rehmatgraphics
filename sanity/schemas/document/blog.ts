import { defineField, defineType } from "sanity";

const blog = defineType({
  name: "blog",
  title: "Blog",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
      group: "content",
    }),
    // defineField({
    //   name: "title",
    //   title: "Title",
    //   type: "string",
    //   group: "content",
    // }),
    // defineField({
    //   name: "bannerImage",
    //   title: "Banner Image",
    //   type: "imageWithAlt",
    //   group: "content",
    // }),
    // defineField({
    //   name: "description",
    //   title: "Description",
    //   type: "text",
    //   group: "content",
    // }),
    // defineField({
    //   name: "saveAsDraft",
    //   title: "Save as Draft",
    //   type: "boolean",
    //   description:
    //     "If checked, the blog will not be published and will remain in draft mode.",
    //   initialValue: false,
    //   group: "content",
    // }),
    // defineField({
    //   name: "publishedAt",
    //   title: "Published At",
    //   type: "datetime",
    //   description: "The date and time when the blog was published.",
    //   group: "content",
    // }),
    // defineField({
    //   name: "content",
    //   title: "Content",
    //   type: "blogContent",
    //   group: "content",
    // }),
    // defineField({
    //   name: "seo",
    //   title: "SEO Settings",
    //   type: "seoFields",
    //   group: "seo", // Optional: group in a tab
    // }),
  ],
});

export default blog;
