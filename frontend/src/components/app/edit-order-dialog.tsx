import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, useList, type ClienteEndereco, type Endereco } from "@/lib/api";
import { extrasTag, parseExtrasValue, stripTags } from "@/lib/extras";
import { removeNotes, updateOrder, type OrderChanges } from "@/lib/order-actions";
import { TIPOS, useOrders, type OrderView } from "@/lib/orders";
import { useSettings } from "@/lib/settings";

const PAGAMENTOS = [["pix", "Pix"], ["cartao", "Cartão"], ["dinheiro", "Dinheiro"]] as const;

/** Mounted only while editing, so the form starts from the saved order and background refreshes do not overwrite it. */
export function EditOrderDialog({ order, onClose }: { order: OrderView; onClose: () => void }) {
  const qc = useQueryClient();
  const { taxaEntrega } = useSettings();
  const { itens: itemRows, cardapio, clientes, mesas, cupons } = useOrders();
  const ends = useList<Endereco>("endereco").data ?? [];
  const links = useList<ClienteEndereco>("cliente_has_endereco").data ?? [];
  const p = order.pedido;
  const produtos = cardapio.data ?? [];
  const nomeDe = (id: number) => produtos.find((x) => x.id === id)?.nome ?? `Produto #${id}`;

  const [itens, setItens] = useState(() => {
    const m = new Map<number, number>();
    (itemRows.data ?? []).filter((i) => i.pedido_id === p.id).forEach((i) => m.set(i.cardapio_id, (m.get(i.cardapio_id) ?? 0) + 1));
    return m;
  });
  const [tipo, setTipo] = useState(p.tipo_pedido);
  const [clienteId, setClienteId] = useState(p.cliente_id ? String(p.cliente_id) : "");
  const [mesaId, setMesaId] = useState(p.mesa_id ? String(p.mesa_id) : "");
  const [cupomId, setCupomId] = useState(p.cupom_id ? String(p.cupom_id) : "");
  const [entrega, setEntrega] = useState(p.tipo_pedido === "Delivery" ? p.tipo_entrega : "");
  const [variacao, setVariacao] = useState(p.varicao_pedido ?? "");
  const [obs, setObs] = useState(p.observacao_pedido ?? "");
  const [extras, setExtras] = useState(() => stripTags(p.adicional_pedido));
  const [valorExtras, setValorExtras] = useState(() => String(parseExtrasValue(p.adicional_pedido) || ""));
  const [pay, setPay] = useState(() => ({
    pix: String(order.pagamento?.pix ?? ""), cartao: String(order.pagamento?.cartao ?? ""), dinheiro: String(order.pagamento?.dinheiro ?? ""),
  }));

  const setQtd = (id: number, qtd: number) => {
    setItens((m) => new Map(m).set(id, Math.max(0, qtd)));
    if (qtd <= 0) {
      const nome = nomeDe(id);
      setVariacao((t) => removeNotes(t, nome));
      setObs((t) => removeNotes(t, nome));
      setExtras((t) => removeNotes(t, nome));
    }
  };

  const enderecos = links.filter((l) => String(l.cliente_id) === clienteId).map((l) => ends.find((e) => e.id === l.endereco_id)).filter(Boolean) as Endereco[];
  const enderecoTexto = (e: Endereco) => `${e.rua}, ${e.numero}${e.bairro ? " – " + e.bairro : ""}`;
  const opcoesEntrega = [...new Set([...(entrega ? [entrega] : []), ...enderecos.map(enderecoTexto)])];

  const linhas = [...itens].filter(([, q]) => q > 0);
  // Same calculation as the order list, so both show the same total.
  const extrasNum = Math.max(0, Number(valorExtras) || 0);
  const subtotal = linhas.reduce((s, [id, q]) => s + q * Number(produtos.find((x) => x.id === id)?.preco_base ?? 0), 0) + extrasNum;
  const cupom = (cupons.data ?? []).find((c) => String(c.id) === cupomId);
  const total = Math.max(0, subtotal * (1 - (cupom?.valor_percentual ?? 0) / 100) + (tipo === "Delivery" ? taxaEntrega : 0));
  const pago = PAGAMENTOS.reduce((s, [k]) => s + (Number(pay[k]) || 0), 0);

  const save = useMutation({
    mutationFn: (changes: OrderChanges) => updateOrder(p, order.status, changes),
    onSuccess: (avisos) => {
      toast.success(`Pedido #${p.id} atualizado`);
      if (avisos.length) toast.warning(`Atenção: ${avisos.join("; ")}.`);
      onClose();
    },
    onError: (e: Error) => toast.error(`Não foi possível salvar: ${e.message}`),
    onSettled: () => qc.invalidateQueries(),
  });

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!linhas.length) return toast.error("O pedido precisa de ao menos um item");
    if (tipo === "Delivery" && !clienteId) return toast.error("Selecione o cliente para delivery");
    if (tipo === "Delivery" && !entrega) return toast.error("Selecione o endereço de entrega");
    const num = (v: string) => (v ? Number(v) : null);
    save.mutate({
      itens,
      pagamento: { pix: num(pay.pix), cartao: num(pay.cartao), dinheiro: num(pay.dinheiro) },
      pedido: {
        tipo_pedido: tipo,
        tipo_entrega: tipo === "Delivery" ? entrega : tipo === "Retirada" ? "Retirada no balcão" : "Consumo no local",
        cliente_id: num(clienteId), mesa_id: tipo === "Balcão" ? num(mesaId) : null, cupom_id: num(cupomId),
        varicao_pedido: variacao.trim() || null, observacao_pedido: obs.trim() || null,
        // Keep the original text when untouched; it stores a price tag per product.
        adicional_pedido: extras === stripTags(p.adicional_pedido) && extrasNum === parseExtrasValue(p.adicional_pedido)
          ? p.adicional_pedido : `${extras.trim()}${extrasTag(extrasNum)}`.trim() || null,
      },
    });
    return;
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !save.isPending && onClose()}>
      <DialogContent className="max-w-xl text-left">
        <DialogHeader>
          <DialogTitle>Editar pedido #{p.id}</DialogTitle>
          <DialogDescription>Altere o que precisar e salve.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid min-w-0 gap-4 whitespace-normal">
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Itens</p>
            <div className="divide-y rounded-xl border">
              {linhas.length === 0 && <p className="p-3 text-sm text-muted-foreground">Nenhum item.</p>}
              {linhas.map(([id, q]) => (
                <div key={id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{nomeDe(id)}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <Button type="button" size="icon" variant="outline" className="size-8" aria-label={q === 1 ? `Remover ${nomeDe(id)}` : `Menos ${nomeDe(id)}`} onClick={() => setQtd(id, q - 1)}><Minus /></Button>
                    <b className="w-6 text-center">{q}</b>
                    <Button type="button" size="icon" variant="outline" className="size-8" aria-label={`Mais ${nomeDe(id)}`} onClick={() => setQtd(id, q + 1)}><Plus /></Button>
                  </span>
                </div>))}
            </div>
            <select className="field" aria-label="Adicionar produto" value="" onChange={(e) => { const id = Number(e.target.value); if (id) setQtd(id, (itens.get(id) ?? 0) + 1); }}>
              <option value="">+ Adicionar produto…</option>
              {produtos.map((x) => <option key={x.id} value={x.id}>{x.nome} · {brl(Number(x.preco_base))}</option>)}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Campo l="Tipo"><select className="field" value={tipo} onChange={(e) => setTipo(e.target.value)}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></Campo>
            <Campo l="Cliente"><select className="field" value={clienteId} onChange={(e) => { setClienteId(e.target.value); setEntrega(""); }}><option value="">Não identificado</option>{(clientes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></Campo>
            {tipo === "Balcão" && <Campo l="Mesa"><select className="field" value={mesaId} onChange={(e) => setMesaId(e.target.value)}><option value="">Sem mesa</option>{[...(mesas.data ?? [])].sort((a, b) => a.numero - b.numero).map((m) => <option key={m.id} value={m.id}>Mesa {m.numero}{m.ocupada && m.id !== p.mesa_id ? " (ocupada)" : ""}</option>)}</select></Campo>}
            {tipo === "Delivery" && <Campo l="Endereço de entrega"><select className="field" value={entrega} onChange={(e) => setEntrega(e.target.value)}><option value="">Selecione…</option>{opcoesEntrega.map((t) => <option key={t}>{t}</option>)}</select></Campo>}
            <Campo l="Cupom"><select className="field" value={cupomId} onChange={(e) => setCupomId(e.target.value)}><option value="">Sem cupom</option>{(cupons.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome} (−{c.valor_percentual}%)</option>)}</select></Campo>
          </div>

          <Campo l="Variação"><input className="field" value={variacao} onChange={(e) => setVariacao(e.target.value)} /></Campo>
          <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
            <Campo l="Extras"><input className="field" value={extras} onChange={(e) => setExtras(e.target.value)} /></Campo>
            <Campo l="Valor extras (R$)"><input className="field" type="number" min="0" step="0.01" value={valorExtras} onChange={(e) => setValorExtras(e.target.value)} /></Campo>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">Se mudar a quantidade de um item com extras, confira o valor dos extras.</p>
          <Campo l="Observação"><input className="field" value={obs} onChange={(e) => setObs(e.target.value)} /></Campo>

          <div className="grid gap-2">
            <p className="text-sm font-semibold">Pagamento</p>
            <div className="grid grid-cols-3 gap-2">{PAGAMENTOS.map(([k, label]) => (
              <label key={k} className="grid gap-1">
                <button type="button" className="rounded-lg bg-secondary py-1 text-xs font-semibold hover:bg-accent" onClick={() => setPay({ pix: "", cartao: "", dinheiro: "", [k]: total.toFixed(2) })}>{label}</button>
                <input className="field h-9" type="number" min="0" step="0.01" aria-label={label} placeholder="0,00" value={pay[k]} onChange={(e) => setPay({ ...pay, [k]: e.target.value })} />
              </label>))}</div>
            <p className="text-xs text-muted-foreground">{pago + 0.009 < total ? `Atenção: faltam ${brl(total - pago)}` : pago > total + 0.009 ? `Troco: ${brl(pago - total)}` : "Pagamento completo"}</p>
          </div>

          <div className="flex justify-between border-t pt-3 text-xl font-bold"><span>Total</span><span className="text-primary">{brl(total)}</span></div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={save.isPending} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : "Salvar alterações"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const Campo = ({ l, children }: { l: string; children: ReactNode }) => <label className="grid min-w-0 gap-1.5"><span className="text-sm font-medium">{l}</span>{children}</label>;
