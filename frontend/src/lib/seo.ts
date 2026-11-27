export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Sabor & Cia` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Sabor & Cia` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
