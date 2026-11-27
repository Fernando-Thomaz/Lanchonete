import type { OrderView } from "./orders";

export function salesByDay(orders: OrderView[], days = 7) {
  const out: { dia: string; vendas: number; pedidos: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10);
    const os = orders.filter((o) => o.status !== "Cancelado" && o.criado?.slice(0, 10) === key);
    out.push({ dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), vendas: os.reduce((s, o) => s + o.total, 0), pedidos: os.length });
  }
  return out;
}
export function topProducts(orders: OrderView[], n = 5) {
  const m = new Map<string, number>();
  orders.filter((o) => o.status !== "Cancelado").forEach((o) => o.itens.forEach((i) => m.set(i.nome, (m.get(i.nome) ?? 0) + 1)));
  return [...m].map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, n);
}
export function countBy<T>(arr: T[], key: (t: T) => string, val: (t: T) => number = () => 1) {
  const m = new Map<string, number>(); arr.forEach((a) => m.set(key(a), (m.get(key(a)) ?? 0) + val(a)));
  return [...m].map(([name, value]) => ({ name, value }));
}
