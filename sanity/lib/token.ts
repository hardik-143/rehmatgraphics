export const readToken = process.env.SANITY_READ_TOKEN;
export const writeToken = process.env.SANITY_WRITE_TOKEN;
if (!readToken) {
  throw new Error("SANITY_READ_TOKEN is not defined");
}
if (!writeToken) {
  throw new Error("SANITY_WRITE_TOKEN is not defined");
}
