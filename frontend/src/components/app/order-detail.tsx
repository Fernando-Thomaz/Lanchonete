import { stripTags } from "@/lib/extras";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, brl, fmtTime } from "@/lib/api";
import { restoreStock } from "@/lib/combos";
import { STATUS, type OrderView } from "@/lib/orders";
import { StatusBadge } from "./ui-bits";
import { OrderActions } from "./order-actions";

export function useSetStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pedidoId, status, mesaId }: { pedidoId: number; status: string; mesaId?: number | null }) => {
      await api.create("status_pedido", { pedido_id: pedidoId, status_pedido: status, dt: new Date().toISOString() });
      if (mesaId && (status === "Entregue/Retirado" || status === "Cancelado")) await api.update("mesa", mesaId, { ocupada: false });
      if (status === "Cancelado") { try { await restoreStock(pedidoId); } catch { toast.warning("Pedido cancelado, mas o estoque não pôde ser devolvido"); } }
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["status_pedido"] }); qc.invalidateQueries({ queryKey: ["mesa"] }); qc.invalidateQueries({ queryKey: ["estoque"] }); toast.success(`Pedido #${v.pedidoId}: ${v.status}`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function StatusSelect({ order }: { order: OrderView }) {
  const set = useSetStatus();
  return (
    <select aria-label="Atualizar status" className="field h-9 w-40 max-w-full text-xs" value={order.status} disabled={set.isPending}
      onChange={(e) => set.mutate({ pedidoId: order.pedido.id, status: e.target.value, mesaId: order.pedido.mesa_id })}>
      {STATUS.map((s) => <option key={s}>{s}</option>)}
    </select>
  );
}

export function OrderDetail({ order, onClose }: { order: OrderView | null; onClose: () => void }) {
  const grouped = new Map<string, { qtd: number; preco: number }>();
  order?.itens.forEach((i) => { const g = grouped.get(i.nome) ?? { qtd: 0, preco: Number(i.preco_base) }; g.qtd++; grouped.set(i.nome, g); });
  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {order && <>
          <DialogHeader><DialogTitle className="flex flex-wrap items-center gap-2 pr-6">Pedido #{order.pedido.id} <StatusBadge status={order.status} /></DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Info l="Cliente" v={order.cliente?.nome ?? "Não identificado"} /><Info l="Tipo" v={`${order.pedido.tipo_pedido}${order.mesa ? ` · Mesa ${order.mesa.numero}` : ""}`} />
            <Info l="Entrega" v={order.pedido.tipo_entrega} /><Info l="Pagamento" v={order.pagoCom} />
            {order.entregador && <Info l="Entregador" v={order.entregador.nome} />}
          </div>
          <div className="rounded-xl border">
            {[...grouped].map(([n, g]) => <div key={n} className="flex justify-between border-b px-3 py-2 text-sm last:border-0"><span>{g.qtd}× {n}</span><span>{brl(g.qtd * g.preco)}</span></div>)}
            {grouped.size === 0 && <p className="p-3 text-sm text-muted-foreground">Sem itens registrados.</p>}
          </div>
          {(order.pedido.varicao_pedido || order.pedido.adicional_pedido || order.pedido.observacao_pedido) && (
            <div className="space-y-1 rounded-xl bg-secondary p-3 text-sm">
              {order.pedido.varicao_pedido && <p><b>Variação:</b> {order.pedido.varicao_pedido}</p>}
              {order.pedido.adicional_pedido && <p><b>Extras:</b> {stripTags(order.pedido.adicional_pedido)}</p>}
              {order.pedido.observacao_pedido && <p><b>Obs.:</b> {order.pedido.observacao_pedido}</p>}
            </div>)}
          <div className="space-y-1 text-sm">
            <Row l="Subtotal" v={brl(order.subtotal)} />{order.desconto > 0 && <Row l={`Cupom ${order.cupom?.nome}`} v={`− ${brl(order.desconto)}`} />}
            {order.taxa > 0 && <Row l="Taxa de entrega" v={brl(order.taxa)} />}
            <div className="flex justify-between pt-2 font-display text-xl font-bold"><span>Total</span><span className="text-primary">{brl(order.total)}</span></div>
          </div>
          <div><p className="mb-2 text-sm font-semibold">Linha do tempo</p>
            <ol className="space-y-1 border-l-2 border-primary/30 pl-4 text-sm">{order.historico.map((h) => <li key={h.id}><span className="text-muted-foreground">{fmtTime(h.dt)}</span> · {h.status_pedido}</li>)}</ol></div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <StatusSelect order={order} />
            <div className="flex gap-2"><OrderActions key={order.pedido.id} order={order} labels /></div>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  );
}
const Info = ({ l, v }: { l: string; v: string }) => <div className="rounded-xl bg-muted p-2"><p className="text-xs text-muted-foreground">{l}</p><p className="font-semibold">{v}</p></div>;
const Row = ({ l, v }: { l: string; v: string }) => <div className="flex justify-between text-muted-foreground"><span>{l}</span><span>{v}</span></div>;
