import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudTable } from "@/components/app/crud-table";
import { PageHeader } from "@/components/app/ui-bits";
import { brl, useList, type Cardapio, type Categoria, type Estoque, type Promocao, type CardapioEstoque } from "@/lib/api";
import { seo } from "@/lib/seo";
import { ProductArt } from "@/components/app/product-art";
import { CombosPanel } from "@/components/app/combos";
import { ProductDialog } from "@/components/app/product-dialog";
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { readCombos } from "@/lib/combos";

export const Route = createFileRoute("/cardapio")({
  head: () => seo("Cardápio", "Produtos, categorias e ficha técnica do cardápio."),
  component: CardapioPage,
});

function CardapioPage() {
  const cats = useList<Categoria>("categoria").data ?? [];
  const promos = useList<Promocao>("promocao").data ?? [];
  const est = useList<Estoque>("estoque").data ?? [];
  const ficha = useList<CardapioEstoque>("cardapio_has_estoque").data ?? [];
  const [view, setView] = useState<Cardapio | null>(null);
  const [form, setForm] = useState<{ p: Cardapio | null } | null>(null);
  const catOpts = cats.map((c) => ({ value: c.id, label: c.nome }));
  return (
    <>
      <PageHeader title="Cardápio" subtitle="Tudo o que sai da chapa, organizado por categoria." />
      <Tabs defaultValue="produtos">
        <TabsList className="mb-4"><TabsTrigger value="produtos">Produtos</TabsTrigger><TabsTrigger value="combos">Combos</TabsTrigger><TabsTrigger value="categorias">Categorias</TabsTrigger></TabsList>
        <TabsContent value="produtos">
          <CrudTable resource="cardapio" label="Produto" searchKeys={["nome"]} filter={(r) => !readCombos()[r.id]} onOpenForm={(r) => setForm({ p: r as Cardapio | null })} rowActions={(r) => <Button size="icon" variant="ghost" aria-label="Ver ficha técnica" onClick={() => setView(r as Cardapio)}><ClipboardList /></Button>} fields={[
            { key: "nome", label: "Nome", required: true, render: (r) => <span className="flex items-center gap-3"><ProductArt name={r.nome} category={cats.find((c) => c.id === r.categoria_id)?.nome} className="size-9 rounded-lg" small />{r.nome}</span> },
            { key: "preco_base", label: "Preço", type: "number", required: true, render: (r) => brl(Number(r.preco_base)) },
            { key: "categoria_id", label: "Categoria", type: "select", required: true, options: catOpts },
            { key: "_ficha", label: "Ficha técnica", virtual: true, render: (r) => { const n = ficha.filter((f) => f.cardapio_id === r.id).length; return n ? `${n} ingrediente${n > 1 ? "s" : ""}` : <span className="font-semibold text-destructive">Incompleta</span>; } },
            { key: "promocao_id", label: "Promoção", type: "select", options: promos.map((p) => ({ value: p.id, label: p.nome === "Sem promoção" ? "—" : `${p.nome} (-${p.valor_percentual}%)` })) },
          ]} hint={cats.length === 0 ? "Cadastre uma categoria antes de criar produtos." : est.length === 0 ? "Cadastre ingredientes no Estoque antes de criar produtos." : undefined} />
        </TabsContent>
        <TabsContent value="combos"><CombosPanel /></TabsContent>
        <TabsContent value="categorias">
          <CrudTable resource="categoria" label="Categoria" fields={[{ key: "nome", label: "Nome", required: true }]} />
        </TabsContent>
      </Tabs>
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ficha técnica — {view?.nome}</DialogTitle></DialogHeader>
          {(() => { const rows = ficha.filter((f) => f.cardapio_id === view?.id); return rows.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum ingrediente cadastrado.</p> :
            <ul className="divide-y text-sm">{rows.map((r) => { const e = est.find((x) => x.id === r.estoque_id); return <li key={r.id} className="flex justify-between py-2"><span>{e?.nome ?? `Ingrediente #${r.estoque_id}`}</span><span className="font-semibold">{r.qtd} {e?.unidade_medida ?? ""}</span></li>; })}</ul>; })()}
          {view && <Button variant="outline" className="w-fit" onClick={() => { const p = view; setView(null); setForm({ p }); }}>Editar ficha</Button>}
        </DialogContent>
      </Dialog>
      <ProductDialog open={!!form} product={form?.p ?? null} onClose={() => setForm(null)} />
    </>
  );
}
