import { useList, type Cardapio, type Cliente, type Cupom, type ItemPedido, type Mesa, type Pagamento, type Pedido, type StatusPedido, type TrabPedido, type Trabalhador, type Categoria } from "./api";
import { useSettings } from "./settings";
import { parseExtrasValue } from "./extras";

export const STATUS = ["Recebido", "Em preparo", "Pronto", "Saiu para entrega", "Entregue/Retirado", "Cancelado"] as const;
export type Status = (typeof STATUS)[number];
export const TIPOS = ["Balcão", "Retirada", "Delivery"] as const;

export const statusTone: Record<string, string> = {
  "Recebido": "bg-info/15 text-info",
  "Em preparo": "bg-warning/25 text-accent-foreground",
  "Pronto": "bg-success/15 text-success",
  "Saiu para entrega": "bg-primary/15 text-primary",
  "Entregue/Retirado": "bg-muted text-muted-foreground",
  "Cancelado": "bg-destructive/15 text-destructive",
};

export interface OrderView {
  pedido: Pedido; status: string; criado: string | null; historico: StatusPedido[];
  itens: Cardapio[]; cliente?: Cliente; mesa?: Mesa; cupom?: Cupom; pagamento?: Pagamento;
  entregador?: Trabalhador; subtotal: number; desconto: number; taxa: number; total: number; pagoCom: string;
}

export function useOrders() {
  const settings = useSettings();
  const qs = {
    pedidos: useList<Pedido>("pedido"), status: useList<StatusPedido>("status_pedido"),
    itens: useList<ItemPedido>("is_combo"), cardapio: useList<Cardapio>("cardapio"),
    clientes: useList<Cliente>("cliente"), mesas: useList<Mesa>("mesa"), cupons: useList<Cupom>("cupom"),
    pagamentos: useList<Pagamento>("pagamento"), trab: useList<Trabalhador>("trabalhador"),
    tp: useList<TrabPedido>("trabalhador_has_pedido"), categorias: useList<Categoria>("categoria"),
  };
  const isLoading = Object.values(qs).some((q) => q.isLoading);
  const error = Object.values(qs).find((q) => q.error)?.error as Error | undefined;
  const byId = <T extends { id: number }>(arr?: T[]) => new Map((arr ?? []).map((x) => [x.id, x]));
  const card = byId(qs.cardapio.data), cli = byId(qs.clientes.data), mes = byId(qs.mesas.data),
    cup = byId(qs.cupons.data), pag = byId(qs.pagamentos.data), tr = byId(qs.trab.data);

  const orders: OrderView[] = (qs.pedidos.data ?? []).map((p) => {
    const historico = (qs.status.data ?? []).filter((s) => s.pedido_id === p.id).sort((a, b) => a.dt.localeCompare(b.dt));
    const itens = (qs.itens.data ?? []).filter((i) => i.pedido_id === p.id).map((i) => card.get(i.cardapio_id)).filter(Boolean) as Cardapio[];
    const subtotal = itens.reduce((s, i) => s + Number(i.preco_base), 0) + parseExtrasValue(p.adicional_pedido);
    const cupom = p.cupom_id ? cup.get(p.cupom_id) : undefined;
    const desconto = cupom ? subtotal * (cupom.valor_percentual / 100) : 0;
    const taxa = p.tipo_pedido === "Delivery" ? settings.taxaEntrega : 0;
    const pagamento = pag.get(p.pagamento_id);
    const pagoCom = pagamento ? (["dinheiro", "pix", "cartao"] as const).filter((k) => pagamento[k]).map((k) => (k === "cartao" ? "Cartão" : k === "pix" ? "Pix" : "Dinheiro")).join(" + ") || "—" : "—";
    const tpRow = (qs.tp.data ?? []).filter((t) => t.pedido_id === p.id).at(-1);
    return {
      pedido: p, historico, status: historico.at(-1)?.status_pedido ?? "Recebido", criado: historico[0]?.dt ?? null,
      itens, cliente: p.cliente_id ? cli.get(p.cliente_id) : undefined, mesa: p.mesa_id ? mes.get(p.mesa_id) : undefined,
      cupom, pagamento, entregador: tpRow ? tr.get(tpRow.trabalhador_id) : undefined,
      subtotal, desconto, taxa, total: Math.max(0, subtotal - desconto + taxa), pagoCom,
    };
  }).sort((a, b) => b.pedido.id - a.pedido.id);

  return { orders, isLoading, error, ...qs };
}
