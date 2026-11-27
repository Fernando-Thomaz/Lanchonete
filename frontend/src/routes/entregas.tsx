import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bike, Clock, MapPin } from "lucide-react";
import { Empty, ErrorState, Loading, PageHeader, Panel, StatusBadge } from "@/components/app/ui-bits";
import { OrderDetail, StatusSelect } from "@/components/app/order-detail";
import { api, brl, fmtTime } from "@/lib/api";
import { useOrders, type OrderView } from "@/lib/orders";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/entregas")({
  head: () => seo("Entregas", "Painel de delivery com atribuição de entregadores."),
  component: EntregasPage,
});

const COLS = [["Aguardando", ["Recebido", "Em preparo", "Pronto"]], ["Em rota", ["Saiu para entrega"]], ["Concluídas", ["Entregue/Retirado"]]] as const;

function EntregasPage() {
  const { orders, isLoading, error, trab, pedidos } = useOrders();
  const qc = useQueryClient();
  const [view, setView] = useState<OrderView | null>(null);
  const deliv = orders.filter((o) => o.pedido.tipo_pedido === "Delivery");
  const atribuir = async (o: OrderView, tid: string) => {
    if (!tid) return;
    try { await api.create("trabalhador_has_pedido", { pedido_id: o.pedido.id, trabalhador_id: Number(tid) }); await qc.invalidateQueries({ queryKey: ["trabalhador_has_pedido"] }); toast.success("Entregador atribuído"); }
    catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHeader title="Entregas" subtitle={`${deliv.filter((o) => o.status !== "Entregue/Retirado" && o.status !== "Cancelado").length} entregas em aberto`} />
      {isLoading ? <Loading /> : error ? <ErrorState error={error} onRetry={() => pedidos.refetch()} /> : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLS.map(([t, sts]) => { const list = deliv.filter((o) => (sts as readonly string[]).includes(o.status)); return (
            <Panel key={t} title={`${t} (${list.length})`}>
              {list.length === 0 ? <Empty title="Nada aqui" /> : <div className="space-y-3">{list.map((o) => (
                <div key={o.pedido.id} className="rounded-xl border bg-background p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2"><button className="min-w-0 truncate text-left font-display font-bold hover:text-primary" onClick={() => setView(o)}>#{o.pedido.id} · {o.cliente?.nome ?? "Cliente"}</button><StatusBadge status={o.status} /></div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{o.pedido.tipo_entrega}</p>
                  <p className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock className="size-3.5" />{fmtTime(o.criado)}</span>Taxa {brl(o.taxa)} · Total <b className="text-foreground">{brl(o.total)}</b></p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Bike className="size-4 text-primary" />
                    <select className="field h-9 w-40 max-w-full text-xs" value="" onChange={(e) => atribuir(o, e.target.value)}><option value="">{o.entregador?.nome ?? "Atribuir entregador"}</option>{(trab.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select>
                    <StatusSelect order={o} />
                  </div>
                </div>))}</div>}
            </Panel>); })}
        </div>)}
      <OrderDetail order={view ? orders.find((o) => o.pedido.id === view.pedido.id) ?? null : null} onClose={() => setView(null)} />
    </>
  );
}
