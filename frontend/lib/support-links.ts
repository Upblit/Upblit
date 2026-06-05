export const patreonUrl =
  process.env.NEXT_PUBLIC_PATREON_URL || "https://www.patreon.com/Upblit";

export const patreonSubscribeUrl = (() => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/*$/, "");
  return apiBase ? `${apiBase}/patreon/subscribe` : "/patreon/subscribe";
})();