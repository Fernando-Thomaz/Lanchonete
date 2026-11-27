import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, Search, ShoppingBag, Ticket, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, ErrorState, Loading, PageHeader } from "@/components/app/ui-bits";
import { ProductArt } from "@/components/app/product-art";
import { api, brl, useList, type Cardapio, type Categoria, type Cliente, type ClienteEndereco, type Cupom, type Endereco, type Mesa, type Promocao, type CardapioEstoque, type Estoque } from "@/lib/api";
import { TIPOS } from "@/lib/orders";
import { deductStock, expandItems, readCombos } from "@/lib/combos";
import { extrasLabel, extrasTag, extrasValue, readExtraPrices, type Extra } from "@/lib/extras";
import { useSettings } from "@/lib/settings";
import { seo } from "@/lib/seo";
import { cn, formatPhone } from "@/lib/utils";

export const Route = createFileRoute("/novo-pedido")({
  validateSearch: (s: Record<string, unknown>): { mesa?: number } => (s.mesa ? { mesa: Number(s.mesa) } : {}),
  head: () => seo("Novo pedido", "Registre pedidos de balcão, retirada e delivery em segundos."),
  component: NovoPedido,
});

const VARIACOES = ["Normal", "Ao ponto", "Bem passado", "Pão australiano", "Sem glúten"];
interface Line { key: string; prod: Cardapio; qtd: number; variacao: string; extras: Extra[]; obs: string }
const unit = (l: { prod: Cardapio; extras: Extra[] }) => Number(l.prod.preco_base) + extrasValue(l.extras);

function NovoPedido() {
  const { mesa: mesaParam } = Route.useSearch();
  const nav = useNavigate(); const qc = useQueryClient(); const settings = useSettings();
  const prods = useList<Cardapio>("cardapio"); const cats = useList<Categoria>("categoria").data ?? [];
  const promos = useList<Promocao>("promocao").data ?? []; const cupons = useList<Cupom>("cupom").data ?? [];
  const clientes = useList<Cliente>("cliente").data ?? []; const mesas = useList<Mesa>("mesa").data ?? [];
  const ficha = useList<CardapioEstoque>("cardapio_has_estoque").data ?? []; const estoque = useList<Estoque>("estoque").data ?? [];
  const ends = useList<Endereco>("endereco").data ?? []; const links = useList<ClienteEndereco>("cliente_has_endereco").data ?? [];

  const [cat, setCat] = useState<number | null>(null); const [q, setQ] = useState("");
  const [cart, setCart] = useState<Line[]>([]); const [custom, setCustom] = useState<Cardapio | null>(null);
  const [tipo, setTipo] = useState<string>(mesaParam ? "Balcão" : "Balcão");
  const [clienteId, setClienteId] = useState(""); const [mesaId, setMesaId] = useState<string>("");
  const [endId, setEndId] = useState(""); const [cupomCode, setCupomCode] = useState(""); const [cupom, setCupom] = useState<Cupom | null>(null);
  const [pay, setPay] = useState<{ dinheiro: string; pix: string; cartao: string }>({ dinheiro: "", pix: "", cartao: "" });
  const [quick, setQuick] = useState(false); const [saving, setSaving] = useState(false);

  const mesaFromParam = mesas.find((m) => m.numero === mesaParam);
  const mesaSel = mesaId || (mesaFromParam ? String(mesaFromParam.id) : "");

  const price = (p: Cardapio) => { const pr = promos.find((x) => x.id === p.promocao_id); const t = new Date().toISOString().slice(0, 10);
    return pr && t >= pr.dt_inicio && t <= pr.dt_final ? Number(p.preco_base) * (1 - pr.valor_percentual / 100) : Number(p.preco_base); };
  const visible = useMemo(() => (prods.data ?? []).filter((p) => (!cat || p.categoria_id === cat) && p.nome.toLowerCase().includes(q.toLowerCase())), [prods.data, cat, q]);

  const subtotal = cart.reduce((s, l) => s + unit(l) * l.qtd, 0);
  const desconto = cupom ? subtotal * (cupom.valor_percentual / 100) : 0;
  const taxa = tipo === "Delivery" ? settings.taxaEntrega : 0;
  const total = Math.max(0, subtotal - desconto + taxa);
  const pago = ["dinheiro", "pix", "cartao"].reduce((s, k) => s + (Number(pay[k as keyof typeof pay]) || 0), 0);
  const clienteEnds = links.filter((l) => String(l.cliente_id) === clienteId).map((l) => ends.find((e) => e.id === l.endereco_id)).filter(Boolean) as Endereco[];

  const add = (l: Omit<Line, "key">) => setCart((c) => {
    const key = `${l.prod.id}|${l.variacao}|${extrasLabel(l.extras)}|${l.obs}`;
    const ex = c.find((x) => x.key === key);
    return ex ? c.map((x) => (x.key === key ? { ...x, qtd: x.qtd + l.qtd } : x)) : [...c, { ...l, key }];
  });
  const applyCupom = () => {
    const c = cupons.find((x) => x.nome.toLowerCase() === cupomCode.trim().toLowerCase());
    if (!c) return toast.error("Cupom não encontrado");
    if (c.validade < new Date().toISOString().slice(0, 10)) return toast.error("Cupom vencido");
    setCupom(c); return toast.success(`Cupom ${c.nome} aplicado: −${c.valor_percentual}%`);
  };

  const finalizar = async () => {
    if (cart.length === 0) return toast.error("Adicione ao menos um produto");
    if (tipo === "Delivery" && !clienteId) return toast.error("Selecione o cliente para delivery");
    if (tipo === "Delivery" && !endId) return toast.error(clienteEnds.length ? "Selecione o endereço de entrega" : "Este cliente não tem endereço cadastrado");
    if (pago + 0.009 < total) return toast.error(`Pagamento incompleto: faltam ${brl(total - pago)}`);
    setSaving(true);
    try {
      const num = (v: string) => (v ? Number(v) : null);
      const pg = await api.create("pagamento", { dinheiro: num(pay.dinheiro), pix: num(pay.pix), cartao: num(pay.cartao) });
      const end = ends.find((e) => String(e.id) === endId);
      const ped = await api.create("pedido", {
        tipo_pedido: tipo, tipo_entrega: tipo === "Delivery" ? (end ? `${end.rua}, ${end.numero}${end.bairro ? " – " + end.bairro : ""}` : "Delivery") : tipo === "Retirada" ? "Retirada no balcão" : "Consumo no local",
        varicao_pedido: cart.map((l) => `${l.prod.nome}: ${l.variacao}`).join("; ") || null,
        adicional_pedido: cart.filter((l) => extrasValue(l.extras) > 0 || extrasLabel(l.extras)).map((l) => `${l.qtd}× ${l.prod.nome}: ${extrasLabel(l.extras)}${extrasTag(extrasValue(l.extras) * l.qtd)}`).join("; ") || null,
        observacao_pedido: cart.filter((l) => l.obs).map((l) => `${l.prod.nome}: ${l.obs}`).join("; ") || null,
        cliente_id: clienteId ? Number(clienteId) : null, mesa_id: tipo === "Balcão" && mesaSel ? Number(mesaSel) : null,
        cupom_id: cupom?.id ?? null, avaliacao_id: null, pagamento_id: pg.id,
      });
      for (const l of cart) for (let i = 0; i < l.qtd; i++) await api.create("is_combo", { pedido_id: ped.id, cardapio_id: l.prod.id });
      try { await deductStock(cart.flatMap((l) => Array(l.qtd).fill(l.prod.id)), ped.id, cart.flatMap((l) => l.extras.map((e) => ({ estoque_id: e.estoque_id, qtd: e.n * l.qtd })))); } catch { toast.warning("Pedido salvo, mas não foi possível baixar o estoque"); }
      await api.create("status_pedido", { pedido_id: ped.id, status_pedido: "Recebido", dt: new Date().toISOString() });
      if (tipo === "Balcão" && mesaSel) await api.update("mesa", Number(mesaSel), { ocupada: true });
      await qc.invalidateQueries();
      toast.success(`Pedido #${ped.id} registrado!`);
      nav({ to: "/pedidos" });
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
    return;
  };

  return (
    <>
      <PageHeader title="Novo pedido" subtitle="Toque nos produtos para montar o pedido." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-52 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="field pl-9" placeholder="Buscar produto…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {[{ id: null as number | null, nome: "Tudo" }, ...cats].map((c) => <button key={c.id ?? 0} onClick={() => setCat(c.id)} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition", cat === c.id ? "border-transparent bg-flame text-primary-foreground shadow-flame" : "bg-card hover:bg-muted")}>{c.nome}</button>)}
          </div>
          {prods.isLoading ? <Loading /> : prods.error ? <ErrorState error={prods.error as Error} onRetry={() => prods.refetch()} /> : visible.length === 0 ? <Empty title="Nenhum produto" hint="Cadastre produtos no Cardápio." /> : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => { const pr = price(p); return (
                <button key={p.id} onClick={() => setCustom(p)} className="group overflow-hidden rounded-2xl border bg-card text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft">
                  <ProductArt name={p.nome} category={cats.find((c) => c.id === p.categoria_id)?.nome} className="h-24" />
                  <div className="p-3"><p className="line-clamp-2 font-semibold leading-tight">{p.nome}</p>
                    <p className="mt-1 font-bold text-primary">{brl(pr)} {pr < p.preco_base && <span className="text-xs font-normal text-muted-foreground line-through">{brl(Number(p.preco_base))}</span>}</p></div>
                </button>); })}
            </div>)}
        </div>

        <aside id="carrinho" className="h-fit scroll-mt-20 rounded-3xl bg-card p-5 shadow-soft sm:p-6 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><ShoppingBag className="size-5 text-primary" /> Pedido</h2>
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">{TIPOS.map((t) => <button key={t} onClick={() => setTipo(t)} className={cn("rounded-lg py-1.5 text-sm font-semibold transition", tipo === t ? "bg-card shadow-soft text-primary" : "text-muted-foreground")}>{t}</button>)}</div>
          <div className="mb-3 flex gap-2">
            <select className="field" value={clienteId} onChange={(e) => { const id = e.target.value; setClienteId(id); const first = links.find((l) => String(l.cliente_id) === id); setEndId(first ? String(first.endereco_id) : ""); }}><option value="">Cliente (opcional)</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
            <Button size="icon" variant="outline" aria-label="Cadastro rápido de cliente" onClick={() => setQuick(true)}><UserPlus /></Button>
          </div>
          {tipo === "Balcão" && <select className="field mb-3" value={mesaSel} onChange={(e) => setMesaId(e.target.value)}><option value="">Sem mesa (balcão)</option>{mesas.sort((a, b) => a.numero - b.numero).map((m) => <option key={m.id} value={m.id}>Mesa {m.numero}{m.ocupada ? " (ocupada)" : ""}</option>)}</select>}
          {tipo === "Delivery" && <select className="field mb-3" required value={endId} onChange={(e) => setEndId(e.target.value)}><option value="">{clienteId ? (clienteEnds.length ? "Selecione o endereço de entrega *" : "Cliente sem endereço cadastrado") : "Selecione o cliente primeiro"}</option>{clienteEnds.map((e) => <option key={e.id} value={e.id}>{e.rua}, {e.numero}{e.bairro ? ` – ${e.bairro}` : ""}</option>)}</select>}

          <div className="max-h-72 space-y-2 overflow-y-auto">
            {cart.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Carrinho vazio</p> : cart.map((l) => (
              <div key={l.key} className="rounded-xl border p-2.5">
                <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{l.prod.nome}</p><button aria-label="Remover" onClick={() => setCart(cart.filter((x) => x.key !== l.key))}><Trash2 className="size-4 text-muted-foreground hover:text-destructive" /></button></div>
                <p className="text-xs text-muted-foreground">{[l.variacao !== "Normal" && l.variacao, extrasLabel(l.extras), l.obs && `“${l.obs}”`].filter(Boolean).join(" · ")}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1"><Button size="icon" variant="outline" className="size-7" aria-label="Menos" onClick={() => setCart(cart.map((x) => x.key === l.key ? { ...x, qtd: Math.max(1, x.qtd - 1) } : x))}><Minus /></Button>
                    <span className="w-6 text-center text-sm font-bold">{l.qtd}</span>
                    <Button size="icon" variant="outline" className="size-7" aria-label="Mais" onClick={() => setCart(cart.map((x) => x.key === l.key ? { ...x, qtd: x.qtd + 1 } : x))}><Plus /></Button></div>
                  <b className="text-sm">{brl(unit(l) * l.qtd)}</b>
                </div>
              </div>))}
          </div>

          <div className="mt-3 flex gap-2">{cupom ? <div className="flex w-full items-center justify-between rounded-xl bg-accent/40 px-3 py-2 text-sm"><span className="flex items-center gap-2"><Ticket className="size-4" />{cupom.nome} (−{cupom.valor_percentual}%)</span><button aria-label="Remover cupom" onClick={() => setCupom(null)}><X className="size-4" /></button></div> : <>
            <input className="field" placeholder="Cupom" value={cupomCode} onChange={(e) => setCupomCode(e.target.value)} /><Button variant="outline" onClick={applyCupom}>Aplicar</Button></>}</div>

          <div className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
            {desconto > 0 && <div className="flex justify-between text-success"><span>Desconto</span><span>− {brl(desconto)}</span></div>}
            {taxa > 0 && <div className="flex justify-between text-muted-foreground"><span>Taxa de entrega</span><span>{brl(taxa)}</span></div>}
            <div className="flex justify-between pt-1 font-display text-2xl font-bold"><span>Total</span><span className="text-primary">{brl(total)}</span></div>
          </div>

          <p className="mb-2 mt-4 text-sm font-semibold">Pagamento</p>
          <div className="grid grid-cols-3 gap-2">{(["pix", "cartao", "dinheiro"] as const).map((k) => (
            <label key={k} className="grid gap-1"><button type="button" className="rounded-lg bg-secondary py-1 text-xs font-semibold hover:bg-accent" onClick={() => setPay({ dinheiro: "", pix: "", cartao: "", [k]: total.toFixed(2) })}>{k === "cartao" ? "Cartão" : k === "pix" ? "Pix" : "Dinheiro"}</button>
              <input className="field h-9" type="number" step="0.01" placeholder="0,00" value={pay[k]} onChange={(e) => setPay({ ...pay, [k]: e.target.value })} /></label>))}</div>
          <p className={cn("mt-1 text-xs", pago >= total - 0.009 ? "text-success" : "text-muted-foreground")}>{pago >= total - 0.009 ? (pago > total + 0.009 ? `Troco: ${brl(pago - total)}` : "Pagamento completo") : `Faltam ${brl(total - pago)}`}</p>
          <Button className="mt-4 h-12 w-full bg-flame text-base shadow-flame hover:opacity-95" disabled={saving} onClick={finalizar}>{saving ? "Registrando…" : `Finalizar · ${brl(total)}`}</Button>
        </aside>
      </div>
      {cart.length > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-30 lg:hidden">
          <Button asChild className="h-12 w-full justify-between bg-flame px-4 text-base shadow-flame">
            <a href="#carrinho"><span className="flex items-center gap-2"><ShoppingBag /> {cart.reduce((s, l) => s + l.qtd, 0)} {cart.reduce((s, l) => s + l.qtd, 0) === 1 ? "item" : "itens"}</span><b>Ver pedido · {brl(total)}</b></a>
          </Button>
        </div>
      )}

      <CustomizeDialog ficha={ficha} estoque={estoque} prod={custom} onClose={() => setCustom(null)} onAdd={(l) => { add(l); setCustom(null); toast.success(`${l.qtd}× ${l.prod.nome} no pedido`); }} />
      <QuickClient open={quick} onClose={() => setQuick(false)} onCreated={(id) => setClienteId(String(id))} />
    </>
  );
}

function CustomizeDialog({ prod, ficha, estoque, onClose, onAdd }: { prod: Cardapio | null; ficha: CardapioEstoque[]; estoque: Estoque[]; onClose: () => void; onAdd: (l: Omit<Line, "key">) => void }) {
  const [qtd, setQtd] = useState(1); const [variacao, setVariacao] = useState("Normal"); const [ex, setEx] = useState<Record<number, number>>({}); const [obs, setObs] = useState("");
  const reset = () => { setQtd(1); setVariacao("Normal"); setEx({}); setObs(""); };
  const prices = useMemo(() => (prod ? readExtraPrices() : {}), [prod]);
  const ingIds = prod ? [...new Set(ficha.filter((f) => expandItems([prod.id], readCombos()).includes(f.cardapio_id)).map((f) => f.estoque_id))] : [];
  const ings = ingIds.map((id) => estoque.find((e) => e.id === id)).filter(Boolean) as Estoque[];
  const extras: Extra[] = ings.filter((i) => (ex[i.id] ?? 0) > 0).map((i) => ({ estoque_id: i.id, nome: i.nome, n: ex[i.id]!, preco: Number(prices[i.id] ?? 0) }));
  const each = prod ? Number(prod.preco_base) + extrasValue(extras) : 0;
  return (
    <Dialog open={!!prod} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{prod?.nome}</DialogTitle></DialogHeader>
        <div><p className="mb-2 text-sm font-semibold">Variação</p><div className="flex flex-wrap gap-2">{VARIACOES.map((v) => <button key={v} onClick={() => setVariacao(v)} className={cn("rounded-full border px-3 py-1 text-sm", variacao === v && "border-primary bg-primary text-primary-foreground")}>{v}</button>)}</div></div>
        <div><p className="mb-2 text-sm font-semibold">Ingredientes extras</p>
          {ings.length === 0 ? <p className="text-sm text-muted-foreground">Este item não tem ingredientes na ficha técnica.</p> :
            <div className="divide-y rounded-xl border">{ings.map((i) => { const n = ex[i.id] ?? 0; const pr = Number(prices[i.id] ?? 0); return (
              <div key={i.id} className="flex items-center justify-between p-2 pl-3 text-sm">
                <span>{i.nome} <span className="text-muted-foreground">{pr > 0 ? `+${brl(pr)} cada` : "grátis"}</span></span>
                <span className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="size-7" aria-label={`Menos ${i.nome}`} onClick={() => setEx({ ...ex, [i.id]: Math.max(0, n - 1) })}><Minus /></Button>
                  <b className="w-5 text-center">{n}</b>
                  <Button size="icon" variant="ghost" className="size-7" aria-label={`Mais ${i.nome}`} onClick={() => setEx({ ...ex, [i.id]: n + 1 })}><Plus /></Button>
                </span>
              </div>); })}</div>}
        </div>
        <input className="field" placeholder='Observação, ex.: "sem cebola"' value={obs} onChange={(e) => setObs(e.target.value)} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Button size="icon" variant="outline" aria-label="Menos" onClick={() => setQtd(Math.max(1, qtd - 1))}><Minus /></Button><b className="w-6 text-center">{qtd}</b><Button size="icon" variant="outline" aria-label="Mais" onClick={() => setQtd(qtd + 1)}><Plus /></Button></div>
          <Button onClick={() => { if (prod) onAdd({ prod, qtd, variacao, extras, obs: obs.trim() }); reset(); }}>Adicionar · {brl(each * qtd)}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickClient({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: number) => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ nome: "", contato: "", rua: "", numero: "", bairro: "", cep: "" }); const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const c = await api.create("cliente", { nome: f.nome, contato: f.contato });
      if (f.rua && f.numero && f.cep) { const en = await api.create("endereco", { rua: f.rua, numero: Number(f.numero), bairro: f.bairro || null, cep: f.cep }); await api.create("cliente_has_endereco", { cliente_id: c.id, endereco_id: en.id }); }
      await qc.invalidateQueries(); onCreated(c.id); toast.success("Cliente cadastrado"); onClose(); setF({ nome: "", contato: "", rua: "", numero: "", bairro: "", cep: "" });
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };
  const inp = (k: keyof typeof f, ph: string, req = false) => <input className="field" placeholder={ph} required={req} value={f[k]} onChange={(e) => setF({ ...f, [k]: k === "contato" ? formatPhone(e.target.value) : e.target.value })} />;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Cadastro rápido de cliente</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-2">{inp("nome", "Nome *", true)}{inp("contato", "Telefone *", true)}
          <p className="mt-2 text-xs text-muted-foreground">Endereço (opcional, para delivery)</p>
          <div className="grid grid-cols-[1fr_90px] gap-2">{inp("rua", "Rua")}{inp("numero", "Nº")}</div>
          <div className="grid grid-cols-2 gap-2">{inp("bairro", "Bairro")}{inp("cep", "CEP")}</div>
          <Button type="submit" disabled={busy} className="mt-2">{busy ? "Salvando…" : "Cadastrar"}</Button></form>
      </DialogContent>
    </Dialog>
  );
}
