import { api, type ItemPedido, type Pedido, type Resource, type Row, type StatusPedido } from "./api";
import { adjustStock, archiveMovimentos, restoreStock } from "./combos";

const FECHADOS = ["Entregue/Retirado", "Cancelado"];
const FILHOS: Resource[] = ["trabalhador_has_pedido", "is_combo", "status_pedido"];

/** Whether any order other than `ignorar` is still open on the table. */
async function mesaEmUso(mesaId: number, ignorar: number) {
  const [pedidos, status] = await Promise.all([api.list<Pedido>("pedido"), api.list<StatusPedido>("status_pedido")]);
  return pedidos.some((p) => {
    if (p.id === ignorar || p.mesa_id !== mesaId) return false;
    const ultimo = status.filter((s) => s.pedido_id === p.id).sort((a, b) => a.dt.localeCompare(b.dt)).at(-1);
    return !FECHADOS.includes(ultimo?.status_pedido ?? "Recebido");
  });
}

async function liberarMesa(mesaId: number, pedidoId: number) {
  if (!(await mesaEmUso(mesaId, pedidoId))) await api.update("mesa", mesaId, { ocupada: false });
}

/**
 * The server refuses to delete an order while other records point to it,
 * so those go first. Safe to run again if it stops halfway.
 * Returns warnings for the follow-up steps that failed.
 */
export async function deleteOrder(pedido: Pedido, status: string): Promise<string[]> {
  for (const r of FILHOS) {
    const rows = (await api.list<Row>(r)).filter((x) => x.pedido_id === pedido.id);
    for (const row of rows) await api.remove(r, row.id);
  }
  await api.remove("pedido", pedido.id);

  const avisos: string[] = [];
  // The payment can only be removed after the order that references it.
  try {
    const emUso = (await api.list<Pedido>("pedido")).some((p) => p.pagamento_id === pedido.pagamento_id);
    if (!emUso) await api.remove("pagamento", pedido.pagamento_id);
  } catch { avisos.push("o pagamento ligado ao pedido não foi apagado"); }
  try {
    // Delivered orders really used their ingredients; cancelled ones were already returned.
    if (!FECHADOS.includes(status)) await restoreStock(pedido.id);
    archiveMovimentos(pedido.id);
  } catch { avisos.push("o estoque não pôde ser devolvido"); }
  if (pedido.mesa_id && !FECHADOS.includes(status)) {
    try { await liberarMesa(pedido.mesa_id, pedido.id); } catch { avisos.push("a mesa não pôde ser liberada"); }
  }
  return avisos;
}

export interface OrderChanges {
  pedido: Pick<Pedido, "tipo_pedido" | "tipo_entrega" | "cliente_id" | "mesa_id" | "cupom_id" | "varicao_pedido" | "adicional_pedido" | "observacao_pedido">;
  pagamento: { dinheiro: number | null; pix: number | null; cartao: number | null };
  /** Desired quantity for each product id. */
  itens: Map<number, number>;
}

export async function updateOrder(original: Pedido, status: string, changes: OrderChanges): Promise<string[]> {
  const id = original.id;
  await api.update("pedido", id, changes.pedido);
  await api.update("pagamento", original.pagamento_id, changes.pagamento);

  // Compare with what the server has now, so saving again after a failure does not duplicate items.
  const atuais = (await api.list<ItemPedido>("is_combo")).filter((i) => i.pedido_id === id);
  const added: number[] = [], removed: number[] = [];
  for (const prod of new Set([...atuais.map((i) => i.cardapio_id), ...changes.itens.keys()])) {
    const rows = atuais.filter((i) => i.cardapio_id === prod);
    const want = changes.itens.get(prod) ?? 0;
    for (let i = rows.length; i < want; i++) { await api.create("is_combo", { pedido_id: id, cardapio_id: prod }); added.push(prod); }
    for (const row of rows.slice(want)) { await api.remove("is_combo", row.id); removed.push(prod); }
  }

  const avisos: string[] = [];
  try { await adjustStock(id, added, removed); } catch { avisos.push("o estoque não pôde ser ajustado"); }
  const antes = original.mesa_id, depois = changes.pedido.mesa_id;
  if (antes !== depois && !FECHADOS.includes(status)) {
    try {
      if (depois) await api.update("mesa", depois, { ocupada: true });
      if (antes) await liberarMesa(antes, id);
    } catch { avisos.push("a situação das mesas não foi atualizada"); }
  }
  return avisos;
}

/** Drops the "Product: ..." notes of products that left the order. Notes are saved as "A: x; B: y". */
export function removeNotes(text: string, nome: string) {
  return text.split("; ").filter((part) => !part.replace(/^\d+× /, "").startsWith(`${nome}: `)).join("; ");
}
