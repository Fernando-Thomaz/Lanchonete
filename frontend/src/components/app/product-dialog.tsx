import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, SEM_PROMO, semPromocaoId, useList, type Cardapio, type CardapioEstoque, type Categoria, type Estoque, type Promocao } from "@/lib/api";

type Ing = { rowId?: number; estoque_id: string; qtd: string };

/** Product form that requires the ficha técnica (ingredients) before saving. */
export function ProductDialog({ open, product, onClose }: { open: boolean; product: Cardapio | null; onClose: () => void }) {
  const qc = useQueryClient();
  const cats = useList<Categoria>("categoria").data ?? [];
  const promos = useList<Promocao>("promocao").data ?? [];
  const est = useList<Estoque>("estoque").data ?? [];
  const ficha = useList<CardapioEstoque>("cardapio_has_estoque").data ?? [];
  const [f, setF] = useState({ nome: "", preco: "", cat: "", promo: "" });
  const [ings, setIngs] = useState<Ing[]>([]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setF({ nome: product?.nome ?? "", preco: product ? String(product.preco_base) : "", cat: product ? String(product.categoria_id) : "", promo: product?.promocao_id && promos.find((p) => p.id === product.promocao_id)?.nome !== SEM_PROMO ? String(product.promocao_id) : "" });
    const rows = product ? ficha.filter((r) => r.cardapio_id === product.id).map((r) => ({ rowId: r.id, estoque_id: String(r.estoque_id), qtd: String(r.qtd) })) : [];
    setIngs(rows.length ? rows : [{ estoque_id: "", qtd: "1" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const valid = ings.filter((i) => i.estoque_id && Number(i.qtd) > 0);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (valid.length === 0) { toast.error("Preencha a ficha técnica com pelo menos um ingrediente"); return; }
    setSaving(true);
    try {
      // The server rejects products without a promotion, so "Nenhuma" uses a 0% promotion.
      const promoId = f.promo ? Number(f.promo) : await semPromocaoId();
      const body = { nome: f.nome.trim(), preco_base: Number(f.preco), categoria_id: Number(f.cat), promocao_id: promoId };
      let id = product?.id;
      if (id) await api.update("cardapio", id, body); else id = (await api.create("cardapio", body)).id;
      const old = product ? ficha.filter((r) => r.cardapio_id === product.id) : [];
      for (const r of old) if (!valid.some((i) => i.rowId === r.id)) await api.remove("cardapio_has_estoque", r.id);
      for (const i of valid) {
        const b = { cardapio_id: id, estoque_id: Number(i.estoque_id), qtd: Math.max(1, Math.round(Number(i.qtd))) };
        if (i.rowId) await api.update("cardapio_has_estoque", i.rowId, b); else await api.create("cardapio_has_estoque", b);
      }
      await Promise.all([qc.invalidateQueries({ queryKey: ["cardapio"] }), qc.invalidateQueries({ queryKey: ["cardapio_has_estoque"] }), qc.invalidateQueries({ queryKey: ["promocao"] })]);
      toast.success(product ? "Produto atualizado" : "Produto criado"); onClose();
    } catch (err) { toast.error((err as Error).message); } finally { setSaving(false); }
  };

  const set = (k: number, v: Partial<Ing>) => setIngs(ings.map((x, i) => (i === k ? { ...x, ...v } : x)));
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{product ? `Editar ${product.nome}` : "Novo produto"}</DialogTitle></DialogHeader>
        <div className="flex gap-2 text-sm">
          {["1. Item", "2. Ficha técnica"].map((t, i) => <span key={t} className={i + 1 === step ? "rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground" : "rounded-full bg-muted px-3 py-1 text-muted-foreground"}>{t}</span>)}
        </div>
        <form className="grid gap-4" onSubmit={save}>
          {step === 1 ? <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5"><span className="text-sm font-medium">Nome <span className="text-primary">*</span></span><input className="field" required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></label>
            <label className="grid gap-1.5"><span className="text-sm font-medium">Preço <span className="text-primary">*</span></span><input className="field" required type="number" step="0.01" min={0} value={f.preco} onChange={(e) => setF({ ...f, preco: e.target.value })} /></label>
            <label className="grid gap-1.5"><span className="text-sm font-medium">Categoria <span className="text-primary">*</span></span>
              <select className="field" required value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}><option value="">Selecione…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
            <label className="grid gap-1.5"><span className="text-sm font-medium">Promoção</span>
              <select className="field" value={f.promo} onChange={(e) => setF({ ...f, promo: e.target.value })}><option value="">Nenhuma</option>{promos.filter((p) => p.nome !== SEM_PROMO).map((p) => <option key={p.id} value={p.id}>{p.nome} (-{p.valor_percentual}%)</option>)}</select></label>
          </div> : <div>
            <p className="mb-2 text-sm font-semibold">Ingredientes de {f.nome} <span className="text-primary">*</span></p>
            {est.length === 0 ? <p className="text-sm text-destructive">Cadastre ingredientes no Estoque primeiro.</p> :
              <div className="grid gap-2">
                {ings.map((i, k) => (
                  <div key={k} className="flex gap-2">
                    <select className="field flex-1" aria-label="Ingrediente" value={i.estoque_id} onChange={(e) => set(k, { estoque_id: e.target.value })}>
                      <option value="">Ingrediente…</option>{est.map((e) => <option key={e.id} value={e.id}>{e.nome} ({e.unidade_medida})</option>)}</select>
                    <input className="field w-24" aria-label="Quantidade" type="number" min={1} step={1} value={i.qtd} onChange={(e) => set(k, { qtd: e.target.value })} />
                    <Button type="button" size="icon" variant="ghost" aria-label="Remover ingrediente" onClick={() => setIngs(ings.filter((_, j) => j !== k))}><Trash2 /></Button>
                  </div>))}
                <Button type="button" variant="outline" className="w-fit" onClick={() => setIngs([...ings, { estoque_id: "", qtd: "1" }])}><Plus /> Ingrediente</Button>
              </div>}
          </div>}
          <DialogFooter>
            {step === 2 && <Button type="button" variant="outline" onClick={() => setStep(1)}>Voltar</Button>}
            {step === 1 ? <Button type="submit">Próximo: ficha técnica</Button> : <Button type="submit" disabled={saving || est.length === 0}>{saving ? "Salvando…" : "Salvar produto"}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
