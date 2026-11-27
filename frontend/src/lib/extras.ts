// Price charged per extra unit of an ingredient. Kept on this device: the external API has no field for it.
const KEY = "saborcia.precoExtra";
export type ExtraPrices = Record<string, number>;
export const readExtraPrices = (): ExtraPrices => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
};
export const saveExtraPrice = (estoqueId: number, price: number) => {
  const m = readExtraPrices(); if (price > 0) m[estoqueId] = price; else delete m[estoqueId];
  localStorage.setItem(KEY, JSON.stringify(m));
};

export interface Extra { estoque_id: number; nome: string; n: number; preco: number }
export const extrasValue = (ex: Extra[]) => ex.reduce((s, e) => s + e.n * e.preco, 0);

/** Text saved in the order, with the charged value in a [+x] tag so totals can be rebuilt later. */
export const extrasLabel = (ex: Extra[]) => ex.filter((e) => e.n > 0).map((e) => `+${e.n} ${e.nome}`).join(", ");
export const extrasTag = (value: number) => (value > 0 ? ` [+${value.toFixed(2)}]` : "");
export const parseExtrasValue = (text?: string | null) =>
  [...(text ?? "").matchAll(/\[\+(\d+(?:\.\d+)?)\]/g)].reduce((s, m) => s + Number(m[1]), 0);
export const stripTags = (text?: string | null) => (text ?? "").replace(/\s*\[\+\d+(?:\.\d+)?\]/g, "");
