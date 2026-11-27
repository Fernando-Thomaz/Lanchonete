import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { ErrorState, Loading, PageHeader, Panel, StatCard, Empty } from "@/components/app/ui-bits";
import { brl, useList, type CardapioEstoque, type Estoque } from "@/lib/api";
import { useOrders } from "@/lib/orders";
import { countBy, salesByDay, topProducts } from "@/lib/stats";
import { seo } from "@/lib/seo";
import { Receipt, TrendingUp, Wallet, XCircle } from "lucide-react";

export const Route = createFileRoute("/relatorios")({
  head: () => seo("Relatórios", "Vendas, produtos, pagamentos e desempenho da equipe."),
  component: Relatorios,
});
const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Relatorios() {
  const { orders, isLoading, error, pedidos, categorias, tp, trab } = useOrders();
  const ficha = useList<CardapioEstoque>("cardapio_has_estoque").data ?? [];
  const est = useList<Estoque>("estoque").data ?? [];
  const [dias, setDias] = useState(14);
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={() => pedidos.refetch()} />;
  const limite = new Date(); limite.setDate(limite.getDate() - dias);
  const per = orders.filter((o) => o.criado && new Date(o.criado) >= limite);
  const ok = per.filter((o) => o.status !== "Cancelado");
  const total = ok.reduce((s, o) => s + o.total, 0);
  const cats = new Map((categorias.data ?? []).map((c) => [c.id, c.nome]));
  const porCat = countBy(ok.flatMap((o) => o.itens), (i) => cats.get(i.categoria_id) ?? "Outros", (i) => Number(i.preco_base));
  const porTipo = countBy(ok, (o) => o.pedido.tipo_pedido);
  const pag = ["pix", "cartao", "dinheiro"].map((k) => ({ name: k === "cartao" ? "Cartão" : k === "pix" ? "Pix" : "Dinheiro", value: ok.reduce((s, o) => s + Number((o.pagamento as any)?.[k] ?? 0), 0) })).filter((x) => x.value > 0);
  const tn = new Map((trab.data ?? []).map((t) => [t.id, t.nome]));
  const ids = new Set(ok.map((o) => o.pedido.id));
  const equipe = countBy((tp.data ?? []).filter((t) => ids.has(t.pedido_id)), (t) => tn.get(t.trabalhador_id) ?? "—");
  const consumo = new Map<number, number>();
  ok.forEach((o) => o.itens.forEach((i) => ficha.filter((f) => f.cardapio_id === i.id).forEach((f) => consumo.set(f.estoque_id, (consumo.get(f.estoque_id) ?? 0) + f.qtd))));
  const consumoRows = [...consumo].map(([id, q]) => { const e = est.find((x) => x.id === id); return { name: e ? `${e.nome} (${e.unidade_medida})` : `#${id}`, value: q }; }).sort((a, b) => b.value - a.value);
  const chart = (data: any[], el: React.ReactNode) => data.length === 0 ? <Empty title="Sem dados no período" /> : <div className="h-64"><ResponsiveContainer>{el as any}</ResponsiveContainer></div>;
  return (
    <>
      <PageHeader title="Relatórios" subtitle="Números que contam a história do balcão."
        actions={<select className="field w-44" value={dias} onChange={(e) => setDias(Number(e.target.value))}>{[7, 14, 30, 90].map((d) => <option key={d} value={d}>Últimos {d} dias</option>)}</select>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="flame" label="Faturamento" value={brl(total)} icon={Wallet} />
        <StatCard label="Pedidos" value={ok.length} icon={Receipt} />
        <StatCard tone="mustard" label="Ticket médio" value={brl(ok.length ? total / ok.length : 0)} icon={TrendingUp} />
        <StatCard label="Cancelados" value={per.length - ok.length} icon={XCircle} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Vendas por período" className="lg:col-span-2">{chart(ok, <LineChart data={salesByDay(orders, dias)}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="dia" fontSize={12} /><YAxis fontSize={12} /><Tooltip formatter={(v: number, n) => (n === "vendas" ? brl(v) : v)} /><Line dataKey="vendas" stroke="var(--chart-1)" strokeWidth={3} /><Line dataKey="pedidos" stroke="var(--chart-2)" strokeWidth={2} /></LineChart>)}</Panel>
        <Panel title="Produtos mais vendidos">{chart(ok, <BarChart data={topProducts(ok, 8)} layout="vertical"><XAxis type="number" fontSize={12} /><YAxis type="category" dataKey="nome" width={110} fontSize={12} /><Tooltip /><Bar dataKey="qtd" fill="var(--chart-1)" radius={[0, 8, 8, 0]} /></BarChart>)}</Panel>
        <Panel title="Categorias mais vendidas (R$)">{chart(porCat, <PieChart><Pie data={porCat} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>{porCat.map((_, i) => <Cell key={i} fill={C[i % 5]} />)}</Pie><Tooltip formatter={(v: number) => brl(v)} /><Legend /></PieChart>)}</Panel>
        <Panel title="Pedidos por modalidade">{chart(porTipo, <BarChart data={porTipo}><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} /><Tooltip /><Bar dataKey="value" radius={[8, 8, 0, 0]}>{porTipo.map((_, i) => <Cell key={i} fill={C[i % 5]} />)}</Bar></BarChart>)}</Panel>
        <Panel title="Formas de pagamento">{chart(pag, <PieChart><Pie data={pag} dataKey="value" nameKey="name" outerRadius={90}>{pag.map((_, i) => <Cell key={i} fill={C[i % 5]} />)}</Pie><Tooltip formatter={(v: number) => brl(v)} /><Legend /></PieChart>)}</Panel>
        <Panel title="Desempenho dos funcionários (pedidos)">{chart(equipe, <BarChart data={equipe}><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="var(--chart-3)" radius={[8, 8, 0, 0]} /></BarChart>)}</Panel>
        <Panel title="Consumo estimado de ingredientes">{consumoRows.length === 0 ? <Empty title="Sem dados" hint="Monte a ficha técnica dos produtos no Cardápio." /> : <ul className="space-y-2">{consumoRows.map((r) => <li key={r.name} className="flex justify-between border-b pb-2 text-sm last:border-0"><span>{r.name}</span><b>{r.value}</b></li>)}</ul>}</Panel>
      </div>
    </>
  );
}
