import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, ErrorState, Loading, PageHeader, Panel, StatusBadge } from "@/components/app/ui-bits";
import { OrderDetail, StatusSelect } from "@/components/app/order-detail";
import { OrderActions } from "@/components/app/order-actions";
import { brl, fmtDate, fmtTime } from "@/lib/api";
import { STATUS, TIPOS, useOrders, type OrderView } from "@/lib/orders";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/pedidos")({
  head: () => seo("Pedidos", "Acompanhe e atualize os pedidos da lanchonete."),
  component: PedidosPage,
});

function PedidosPage() {
  const { orders, isLoading, error, pedidos } = useOrders();
  const [q, setQ] = useState(""); const [st, setSt] = useState(""); const [tipo, setTipo] = useState(""); const [dia, setDia] = useState("");
  const [view, setView] = useState<OrderView | null>(null);
  const list = useMemo(() => orders.filter((o) => {
    const s = q.trim().toLowerCase();
    return (!s || String(o.pedido.id).includes(s) || o.cliente?.nome.toLowerCase().includes(s)) && (!st || o.status === st) && (!tipo || o.pedido.tipo_pedido === tipo) && (!dia || o.criado?.slice(0, 10) === dia);
  }), [orders, q, st, tipo, dia]);
  const live = view ? orders.find((o) => o.pedido.id === view.pedido.id) ?? null : null;

  return (
    <>
      <PageHeader title="Pedidos" subtitle="Do pedido à entrega, tudo num lugar só." actions={<Button asChild><Link to="/novo-pedido"><Plus /> Novo pedido</Link></Button>} />
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {["", ...STATUS].map((s) => <button key={s} onClick={() => setSt(s)} className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${st === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
          {s || "Todos"} <span className="opacity-70">{s ? orders.filter((o) => o.status === s).length : orders.length}</span></button>)}
      </div>
      <Panel>
        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="field pl-9" placeholder="Buscar por nº do pedido ou cliente" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="field sm:w-40" value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos os tipos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
          <input type="date" aria-label="Filtrar por dia" className="field sm:w-44" value={dia} onChange={(e) => setDia(e.target.value)} />
        </div>
        {isLoading ? <Loading /> : error ? <ErrorState error={error} onRetry={() => pedidos.refetch()} /> : list.length === 0 ? <Empty title="Nenhum pedido encontrado" action={<Button asChild className="mt-3"><Link to="/novo-pedido">Registrar pedido</Link></Button>} /> : (
          <>
          {/* Telas pequenas: cartões, para os botões ficarem sempre visíveis. */}
          <ul className="space-y-3 md:hidden">{list.map((o) => (
            <li key={o.pedido.id} className="rounded-2xl border p-3 text-sm">
              <div className="flex items-center justify-between gap-2"><b className="font-display text-base">#{o.pedido.id}</b><StatusBadge status={o.status} /></div>
              <div className="mt-1 flex justify-between gap-2"><span className="min-w-0 truncate">{o.cliente?.nome ?? "Balcão"}</span><b>{brl(o.total)}</b></div>
              <p className="text-xs text-muted-foreground">{fmtDate(o.criado)} {fmtTime(o.criado)} · {o.pedido.tipo_pedido}{o.mesa && ` · M${o.mesa.numero}`} · {o.pagoCom}</p>
              <div className="mt-2 flex items-center justify-between gap-2"><StatusSelect order={o} />
                <div className="flex shrink-0"><Button size="icon" variant="ghost" aria-label="Detalhes" onClick={() => setView(o)}><Eye /></Button><OrderActions order={o} /></div></div>
            </li>))}</ul>
          <div className="-mx-4 hidden overflow-x-auto sm:-mx-5 md:block"><table className="w-full min-w-[820px] whitespace-nowrap text-sm">
            <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">{["Nº", "Cliente", "Horário", "Tipo", "Total", "Pagamento", "Status", ""].map((h) => <th key={h} className="px-4 py-2 font-semibold first:pl-5">{h}</th>)}</tr></thead>
            <tbody>{list.map((o) => (
              <tr key={o.pedido.id} className="border-b last:border-0 hover:bg-muted/60">
                <td className="py-3 pl-5 pr-4 font-display font-bold">#{o.pedido.id}</td>
                <td className="px-4">{o.cliente?.nome ?? <span className="text-muted-foreground">Balcão</span>}</td>
                <td className="px-4 text-muted-foreground">{fmtDate(o.criado)} {fmtTime(o.criado)}</td>
                <td className="px-4">{o.pedido.tipo_pedido}{o.mesa && ` · M${o.mesa.numero}`}</td>
                <td className="px-4 font-semibold">{brl(o.total)}</td>
                <td className="px-4">{o.pagoCom}</td>
                <td className="px-4"><div className="flex items-center gap-2"><StatusBadge status={o.status} /><StatusSelect order={o} /></div></td>
                <td className="px-4 text-right"><Button size="icon" variant="ghost" aria-label="Detalhes" title="Detalhes" onClick={() => setView(o)}><Eye /></Button>
                  <OrderActions order={o} /></td>
              </tr>))}</tbody></table></div>
          </>)}
      </Panel>
      <OrderDetail order={live} onClose={() => setView(null)} />
    </>
  );
}
