import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Bike, ChefHat, Plus, Receipt, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Empty, ErrorState, Loading, PageHeader, Panel, StatCard, StatusBadge } from "@/components/app/ui-bits";
import { brl, fmtTime, useList, type Estoque } from "@/lib/api";
import { useOrders } from "@/lib/orders";
import { useSettings } from "@/lib/settings";
import { salesByDay, topProducts } from "@/lib/stats";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard · Sabor & Cia" }, { name: "description", content: "Vendas, pedidos e alertas do dia na Sabor & Cia." },
    { property: "og:title", content: "Dashboard · Sabor & Cia" }, { property: "og:description", content: "Vendas, pedidos e alertas do dia na Sabor & Cia." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const { orders, isLoading, error, pedidos } = useOrders();
  const est = useList<Estoque>("estoque").data ?? [];
  const settings = useSettings(); const { estoqueMinimo } = settings;
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={() => pedidos.refetch()} />;
  const hoje = new Date().toISOString().slice(0, 10);
  const doDia = orders.filter((o) => o.criado?.slice(0, 10) === hoje && o.status !== "Cancelado");
  const vendas = doDia.reduce((s, o) => s + o.total, 0);
  const andamento = orders.filter((o) => ["Recebido", "Em preparo", "Pronto", "Saiu para entrega"].includes(o.status));
  const entregas = orders.filter((o) => o.pedido.tipo_pedido === "Delivery" && !["Entregue/Retirado", "Cancelado"].includes(o.status));
  const low = est.filter((e) => e.qtd < estoqueMinimo);
  const top = topProducts(orders); const chart = salesByDay(orders, 7);
  return (
    <>
      <PageHeader title="Bom serviço! 🔥" subtitle={`Aqui está o movimento da ${settings.nome} hoje.`} actions={<Button asChild className="bg-flame shadow-flame"><Link to="/novo-pedido"><Plus /> Novo pedido</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="flame" label="Vendas do dia" value={brl(vendas)} icon={Wallet} />
        <StatCard label="Pedidos hoje" value={doDia.length} icon={Receipt} hint={`${orders.length} no total`} />
        <StatCard tone="mustard" label="Ticket médio" value={brl(doDia.length ? vendas / doDia.length : 0)} icon={TrendingUp} />
        <StatCard label="Em andamento" value={andamento.length} icon={ChefHat} hint="Recebidos, em preparo e prontos" />
      </div>
      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
        <Panel title="Vendas nos últimos 7 dias" className="lg:col-span-2">
          <div className="h-56 sm:h-64"><ResponsiveContainer><AreaChart data={chart} margin={{ left: -8, right: 8, top: 4 }}>
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="dia" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={48} />
            <Tooltip formatter={(v: number) => brl(v)} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", boxShadow: "var(--shadow-soft)" }} /><Area type="monotone" dataKey="vendas" stroke="var(--chart-1)" strokeWidth={3} fill="url(#g)" />
          </AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Mais vendidos">
          {top.length === 0 ? <Empty title="Sem vendas ainda" /> : <ol className="space-y-3">{top.map((p, i) => (
            <li key={p.nome} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-secondary font-display font-bold text-primary">{i + 1}</span><span className="flex-1 truncate font-medium">{p.nome}</span><b>{p.qtd}</b></li>))}</ol>}
        </Panel>
        <Panel title="Últimos pedidos" className="lg:col-span-2" action={<Link to="/pedidos" className="text-sm font-semibold text-primary">Ver todos</Link>}>
          {orders.length === 0 ? <Empty title="Nenhum pedido ainda" action={<Button asChild className="mt-3"><Link to="/novo-pedido">Registrar o primeiro</Link></Button>} /> :
            <div className="divide-y">{orders.slice(0, 6).map((o) => (
              <div key={o.pedido.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 py-2.5 text-sm sm:grid-cols-[3rem_1fr_auto_auto_6rem]"><b className="font-display">#{o.pedido.id}</b><span className="truncate">{o.cliente?.nome ?? o.pedido.tipo_pedido}</span><b className="text-right sm:order-last">{brl(o.total)}</b><span className="col-start-2 text-xs text-muted-foreground sm:col-start-auto sm:text-sm">{fmtTime(o.criado)}</span><span className="col-start-3 justify-self-end sm:col-start-auto"><StatusBadge status={o.status} /></span></div>))}</div>}
        </Panel>
        <div className="grid gap-6">
          <Panel title="Estoque baixo" action={<AlertTriangle className="size-5 text-destructive" />}>
            {low.length === 0 ? <p className="text-sm text-muted-foreground">Tudo abastecido 👌</p> : <ul className="space-y-2">{low.slice(0, 5).map((e) => <li key={e.id} className="flex justify-between text-sm"><span>{e.nome}</span><b className="text-destructive">{e.qtd} {e.unidade_medida}</b></li>)}</ul>}
            <Link to="/estoque" className="mt-3 inline-block text-sm font-semibold text-primary">Gerenciar estoque</Link>
          </Panel>
          <Panel title="Entregas pendentes" action={<Bike className="size-5 text-primary" />}>
            <p className="font-display text-4xl font-bold">{entregas.length}</p>
            <p className="text-sm text-muted-foreground">{entregas.filter((o) => o.status === "Saiu para entrega").length} em rota · {entregas.filter((o) => !o.entregador).length} sem entregador</p>
            <Link to="/entregas" className="mt-3 inline-block text-sm font-semibold text-primary">Abrir painel</Link>
          </Panel>
        </div>
      </div>
    </>
  );
}
