import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Armchair, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudTable } from "@/components/app/crud-table";
import { Empty, Loading, PageHeader, Panel } from "@/components/app/ui-bits";
import { OrderDetail } from "@/components/app/order-detail";
import { brl, useCrud } from "@/lib/api";
import { useOrders, type OrderView } from "@/lib/orders";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mesas")({
  head: () => seo("Mesas", "Mapa visual das mesas do salão."),
  component: MesasPage,
});

function MesasPage() {
  const { orders, mesas, isLoading } = useOrders();
  const upd = useCrud("mesa", "Mesa").update;
  const [view, setView] = useState<OrderView | null>(null);
  const abertos = (id: number) => orders.filter((o) => o.pedido.mesa_id === id && !["Entregue/Retirado", "Cancelado"].includes(o.status));
  const lista = [...(mesas.data ?? [])].sort((a, b) => a.numero - b.numero);
  return (
    <>
      <PageHeader title="Mesas" subtitle="Salão em tempo real." />
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <span className="flex items-center gap-2"><i className="size-3 rounded-full bg-success" />Livre</span>
        <span className="flex items-center gap-2"><i className="size-3 rounded-full bg-primary" />Ocupada</span>
        <span className="flex items-center gap-2"><i className="size-3 rounded-full bg-warning" />Aguardando pagamento</span>
      </div>
      <Panel className="mb-6">
        {isLoading ? <Loading /> : lista.length === 0 ? <Empty title="Nenhuma mesa" hint="Cadastre as mesas logo abaixo." /> : (
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {lista.map((m) => {
              const ab = abertos(m.id); const total = ab.reduce((s, o) => s + o.total, 0);
              const st = !m.ocupada && ab.length === 0 ? "livre" : ab.length > 0 && ab.every((o) => o.status === "Pronto") ? "pagar" : "ocupada";
              return (
                <div key={m.id} className={cn("rounded-2xl border-2 p-4 transition animate-rise", st === "livre" ? "border-success/40 bg-success/5" : st === "pagar" ? "border-warning bg-warning/10" : "border-primary/50 bg-primary/5")}>
                  <div className="flex items-center justify-between"><p className="font-display text-3xl font-bold">{m.numero}</p><span className="flex items-center gap-1 text-xs text-muted-foreground"><Armchair className="size-4" />{m.qtd_cadeira}</span></div>
                  <p className="text-sm font-semibold">{st === "livre" ? "Livre" : st === "pagar" ? "Aguardando pagamento" : "Ocupada"}</p>
                  <p className="mt-1 font-bold text-primary">{ab.length ? brl(total) : "—"}</p>
                  <div className="mt-2 flex flex-wrap gap-1">{ab.map((o) => <button key={o.pedido.id} onClick={() => setView(o)} className="rounded-md bg-card px-2 py-0.5 text-xs font-semibold shadow-soft">#{o.pedido.id}</button>)}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" asChild className="flex-1"><Link to="/novo-pedido" search={{ mesa: m.numero }}><Plus />Pedido</Link></Button>
                    <Button size="sm" variant="outline" onClick={() => upd.mutate({ id: m.id, ocupada: !m.ocupada })}>{m.ocupada ? "Liberar" : "Ocupar"}</Button>
                  </div>
                </div>);
            })}
          </div>)}
      </Panel>
      <CrudTable resource="mesa" label="Mesa" title="Cadastro de mesas" searchKeys={["numero"]} fields={[
        { key: "numero", label: "Número", type: "number", step: "1", required: true },
        { key: "qtd_cadeira", label: "Cadeiras", type: "number", step: "1", required: true },
        { key: "ocupada", label: "Ocupada", type: "bool" },
      ]} />
      <OrderDetail order={view ? orders.find((o) => o.pedido.id === view.pedido.id) ?? null : null} onClose={() => setView(null)} />
    </>
  );
}
