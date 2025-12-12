import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { readToken as token } from "./token";

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});
