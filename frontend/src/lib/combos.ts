import { api, type CardapioEstoque, type Estoque, type Row } from "./api";

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

const saidaMotivo = (id: number) => `Pedido #${id}`;
const entradaMotivos = (id: number) => [`Cancelamento do pedido #${id}`, `Ajuste do pedido #${id}`];

/** How much of each ingredient the order still holds, according to this device's movement log. */
export function netTaken(pedidoId: number, estoque: Estoque[], movs: Movimento[] = readMovimentos()): Map<number, number> {
  const net = new Map<number, number>();
  for (const m of movs) {
    const sign = m.tipo === "Saída" && m.motivo === saidaMotivo(pedidoId) ? 1 : m.tipo === "Entrada" && entradaMotivos(pedidoId).includes(m.motivo) ? -1 : 0;
    if (!sign) continue;
    const id = m.estoque_id ?? estoque.find((e) => e.nome === m.estoque)?.id;
    if (id != null) net.set(id, (net.get(id) ?? 0) + sign * m.qtd);
  }
  return net;
}

/** Returns to stock whatever the order still holds (only if this device logged the deduction), so it is never returned twice. */
export async function restoreStock(pedidoId: number) {
  const estoque = await api.list<Estoque>("estoque");
  const log: Movimento[] = [];
  for (const [eid, n] of netTaken(pedidoId, estoque)) {
    const e = estoque.find((x) => x.id === eid); if (!e || n <= 0) continue;
    await api.update("estoque", eid, { qtd: Number(e.qtd) + n }, e as unknown as Row);
    log.push({ id: Date.now() + eid, estoque: e.nome, estoque_id: eid, tipo: "Entrada", qtd: n, dt: new Date().toISOString(), motivo: `Cancelamento do pedido #${pedidoId}` });
  }
  appendMovimentos(log);
  return log.length;
}

/** Applies to stock the difference caused by editing an order's items. */
export async function adjustStock(pedidoId: number, addedIds: number[], removedIds: number[]) {
  if (!addedIds.length && !removedIds.length) return 0;
  const [ficha, estoque] = await Promise.all([api.list<CardapioEstoque>("cardapio_has_estoque"), api.list<Estoque>("estoque")]);
  const plus = ingredientUsage(expandItems(addedIds), ficha), minus = ingredientUsage(expandItems(removedIds), ficha);
  const held = netTaken(pedidoId, estoque);
  const log: Movimento[] = [];
  for (const eid of new Set([...plus.keys(), ...minus.keys()])) {
    const e = estoque.find((x) => x.id === eid); if (!e) continue;
    let delta = (plus.get(eid) ?? 0) - (minus.get(eid) ?? 0);
    if (delta < 0) delta = -Math.min(-delta, Math.max(0, held.get(eid) ?? 0));
    if (!delta) continue;
    await api.update("estoque", eid, { qtd: Math.max(0, Number(e.qtd) - delta) }, e as unknown as Row);
    log.push({ id: Date.now() + eid, estoque: e.nome, estoque_id: eid, tipo: delta > 0 ? "Saída" : "Entrada", qtd: Math.abs(delta), dt: new Date().toISOString(), motivo: delta > 0 ? saidaMotivo(pedidoId) : `Ajuste do pedido #${pedidoId}` });
  }
  appendMovimentos(log);
  return log.length;
}

/** Detaches a deleted order's history, because the server may give its number to a new order. */
export function archiveMovimentos(pedidoId: number) {
  const motivos = [saidaMotivo(pedidoId), ...entradaMotivos(pedidoId)];
  const movs = readMovimentos();
  if (!movs.some((m) => motivos.includes(m.motivo))) return;
  localStorage.setItem(MOV_KEY, JSON.stringify(movs.map((m) => (motivos.includes(m.motivo) ? { ...m, motivo: `${m.motivo} (excluído)` } : m))));
  window.dispatchEvent(new Event(MOV_EVENT));
}
