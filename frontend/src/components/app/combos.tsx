import { useEffect, useState } from "react";
import { Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, Panel } from "./ui-bits";
import { api, brl, semPromocaoId, useList, type Cardapio, type Categoria } from "@/lib/api";
import { readCombos, saveCombo, type ComboMap } from "@/lib/combos";

export function CombosPanel() {
  const qc = useQueryClient();
  const prods = useList<Cardapio>("cardapio").data ?? [];
  const cats = useList<Categoria>("categoria").data ?? [];
  const [combos, setCombos] = useState<ComboMap>({});
  const [edit, setEdit] = useState<{ id?: number; nome: string; preco: string; items: number[] } | null>(null);
  const [pick, setPick] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => setCombos(readCombos()), []);
  const byId = new Map(prods.map((p) => [p.id, p]));
  const comboList = prods.filter((p) => combos[p.id]?.length);
  const singles = prods.filter((p) => !combos[p.id]?.length);
  const sum = (ids: number[]) => ids.reduce((s, id) => s + Number(byId.get(id)?.preco_base ?? 0), 0);
  const group = (ids: number[]) => [...new Set(ids)].map((id) => ({ id, n: ids.filter((x) => x === id).length }));

  const save = async () => {
    if (!edit || !edit.nome || edit.items.length < 2) { toast.error("Dê um nome e escolha pelo menos 2 itens"); return; }
    setSaving(true);
    try {
      let catId = cats.find((c) => c.nome.toLowerCase() === "combos")?.id;
      if (!catId) catId = (await api.create("categoria", { nome: "Combos" })).id;
      const body = { nome: edit.nome, preco_base: Number(edit.preco || sum(edit.items)), categoria_id: catId, promocao_id: await semPromocaoId() };
      const id = edit.id ?? (await api.create("cardapio", body)).id;
      if (edit.id) await api.update("cardapio", id, body);
      saveCombo(id, edit.items); setCombos(readCombos());
      await qc.invalidateQueries(); toast.success("Combo salvo"); setEdit(null);
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };
  const remove = async (id: number) => {
    try { await api.remove("cardapio", id); saveCombo(id, []); setCombos(readCombos()); await qc.invalidateQueries(); toast.success("Combo excluído"); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <Panel title="Combos" action={<Button onClick={() => setEdit({ nome: "", preco: "", items: [] })}><Plus /> Novo combo</Button>}>
      <p className="-mt-2 mb-3 text-sm text-muted-foreground">Junte vários itens do cardápio. Ao vender um combo, os ingredientes de cada item saem do estoque.</p>
      {comboList.length === 0 ? <Empty title="Nenhum combo" hint="Ex.: 2 hambúrgueres, ou hambúrguer + batata + refri." /> :
        <div className="divide-y">{comboList.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div><p className="font-semibold">{c.nome} <span className="text-primary">{brl(Number(c.preco_base))}</span></p>
              <p className="text-sm text-muted-foreground">{group(combos[c.id]!).map((g) => `${g.n}× ${byId.get(g.id)?.nome ?? "?"}`).join(" + ")}</p></div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => setEdit({ id: c.id, nome: c.nome, preco: String(c.preco_base), items: [...combos[c.id]!] })}><Pencil /></Button>
              <Button size="icon" variant="ghost" aria-label="Excluir" className="text-destructive" onClick={() => remove(c.id)}><Trash2 /></Button>
            </div>
          </div>))}</div>}

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{edit?.id ? "Editar combo" : "Novo combo"}</DialogTitle></DialogHeader>
          {edit && <div className="grid gap-4">
            <label className="grid gap-1.5"><span className="text-sm font-medium">Nome</span><input className="field" value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} placeholder="Combo Clássico" /></label>
            <div className="flex gap-2">
              <select className="field flex-1" value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">Escolha um item…</option>
                {singles.map((p) => <option key={p.id} value={p.id}>{p.nome} · {brl(Number(p.preco_base))}</option>)}
              </select>
              <Button type="button" disabled={!pick} onClick={() => setEdit({ ...edit, items: [...edit.items, Number(pick)] })}><Plus /> Adicionar</Button>
            </div>
            <div className="divide-y rounded-xl border">
              {edit.items.length === 0 ? <p className="p-3 text-sm text-muted-foreground">Nenhum item ainda.</p> : group(edit.items).map((g) => (
                <div key={g.id} className="flex items-center justify-between p-2 pl-3 text-sm">
                  <span>{byId.get(g.id)?.nome}</span>
                  <span className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { const i = edit.items.indexOf(g.id); setEdit({ ...edit, items: edit.items.filter((_, k) => k !== i) }); }}><Minus /></Button>
                    <b className="w-6 text-center">{g.n}</b>
                    <Button size="icon" variant="ghost" onClick={() => setEdit({ ...edit, items: [...edit.items, g.id] })}><Plus /></Button>
                  </span>
                </div>))}
            </div>
            <label className="grid gap-1.5"><span className="text-sm font-medium">Preço do combo</span>
              <input className="field" type="number" step="any" value={edit.preco} placeholder={`Soma dos itens: ${brl(sum(edit.items))}`} onChange={(e) => setEdit({ ...edit, preco: e.target.value })} /></label>
          </div>}
          <DialogFooter><Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar combo"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
