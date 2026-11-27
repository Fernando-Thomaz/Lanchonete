import { api, type CardapioEstoque, type Estoque } from "./api";

// Combo composition is kept on this device: the external API has no table for it.
const KEY = "saborcia.combos";
export type ComboMap = Record<string, number[]>; // combo cardapio id -> component cardapio ids (repeats allowed)

export const readCombos = (): ComboMap => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
};
export const saveCombo = (id: number, items: number[]) => {
  const m = readCombos(); if (items.length) m[id] = items; else delete m[id];
  localStorage.setItem(KEY, JSON.stringify(m));
};

/** Expands combos into their component products (one level of nesting is resolved recursively). */
export function expandItems(ids: number[], combos: ComboMap = readCombos(), depth = 0): number[] {
  return ids.flatMap((id) => (combos[id]?.length && depth < 5 ? expandItems(combos[id]!, combos, depth + 1) : [id]));
}

/** Sums ingredient usage for the given products using the ficha técnica. */
export function ingredientUsage(productIds: number[], ficha: CardapioEstoque[]): Map<number, number> {
  const use = new Map<number, number>();
  for (const pid of productIds) for (const f of ficha.filter((x) => x.cardapio_id === pid)) use.set(f.estoque_id, (use.get(f.estoque_id) ?? 0) + Number(f.qtd));
  return use;
}

export interface Movimento { id: number; estoque: string; estoque_id?: number; tipo: "Entrada" | "Saída"; qtd: number; dt: string; motivo: string }
const MOV_KEY = "saborcia.movimentos";
export const MOV_EVENT = "saborcia:movimentos";

export const readMovimentos = (): Movimento[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(MOV_KEY) || "[]"); } catch { return []; }
};
/** Prepends entries to the stock movement history and tells open screens to refresh. */
export function appendMovimentos(entries: Movimento[]) {
  if (!entries.length) return;
  try {
    localStorage.setItem(MOV_KEY, JSON.stringify([...entries, ...readMovimentos()].slice(0, 300)));
    window.dispatchEvent(new Event(MOV_EVENT));
  } catch { /* ignore */ }
}

/** Deducts ingredients from stock for ordered products (combos expanded) and logs the movement. */
export async function deductStock(orderedIds: number[], pedidoId: number, extras: { estoque_id: number; qtd: number }[] = []) {
  const [ficha, estoque] = await Promise.all([api.list<CardapioEstoque>("cardapio_has_estoque"), api.list<Estoque>("estoque")]);
  const use = ingredientUsage(expandItems(orderedIds), ficha);
  for (const e of extras) use.set(e.estoque_id, (use.get(e.estoque_id) ?? 0) + e.qtd);
  const log: Movimento[] = [];
  for (const [eid, n] of use) {
    const e = estoque.find((x) => x.id === eid); if (!e) continue;
    await api.update("estoque", eid, { qtd: Math.max(0, Number(e.qtd) - n) });
    log.push({ id: Date.now() + eid, estoque: e.nome, estoque_id: eid, tipo: "Saída", qtd: n, dt: new Date().toISOString(), motivo: `Pedido #${pedidoId}` });
  }
  appendMovimentos(log);
  return log.length;
}

/** Returns to stock whatever an order took out (only if this device logged that deduction) and logs the entry once. */
export async function restoreStock(pedidoId: number) {
  const movs = readMovimentos();
  const saidas = movs.filter((m) => m.tipo === "Saída" && m.motivo === `Pedido #${pedidoId}`);
  if (!saidas.length || movs.some((m) => m.tipo === "Entrada" && m.motivo === `Cancelamento do pedido #${pedidoId}`)) return 0;
  const estoque = await api.list<Estoque>("estoque");
  const log: Movimento[] = [];
  for (const m of saidas) {
    const e = estoque.find((x) => (m.estoque_id ? x.id === m.estoque_id : x.nome === m.estoque)); if (!e) continue;
    await api.update("estoque", e.id, { qtd: Number(e.qtd) + m.qtd });
    e.qtd = Number(e.qtd) + m.qtd;
    log.push({ id: Date.now() + e.id, estoque: e.nome, estoque_id: e.id, tipo: "Entrada", qtd: m.qtd, dt: new Date().toISOString(), motivo: `Cancelamento do pedido #${pedidoId}` });
  }
  appendMovimentos(log);
  return log.length;
}
