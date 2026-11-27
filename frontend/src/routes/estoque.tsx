import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CrudTable } from "@/components/app/crud-table";
import { Empty, PageHeader, Panel } from "@/components/app/ui-bits";
import { useCrud, useList, type Estoque, type Fornecedor } from "@/lib/api";
import { useSettings } from "@/lib/settings";
import { seo } from "@/lib/seo";
import { brl } from "@/lib/api";
import { readExtraPrices, saveExtraPrice } from "@/lib/extras";
import { useEffect } from "react";
import { MOV_EVENT, appendMovimentos, readMovimentos, type Movimento } from "@/lib/combos";

export const Route = createFileRoute("/estoque")({
  head: () => seo("Estoque", "Ingredientes, fornecedores e movimentações de estoque."),
  component: EstoquePage,
});

type Mov = Movimento;

function EstoquePage() {
  const forn = useList<Fornecedor>("fornecedor").data ?? [];
  const { estoqueMinimo } = useSettings();
  const crud = useCrud("estoque", "Estoque");
  const [mov, setMov] = useState<{ item: Estoque; tipo: Mov["tipo"] } | null>(null);
  const [qtd, setQtd] = useState("1"); const [motivo, setMotivo] = useState("");
  const [movs, setMovs] = useState<Mov[]>([]);
  const [onlyLow, setOnlyLow] = useState(false);
  const loadMovs = () => setMovs(readMovimentos());
  // O histórico se atualiza sozinho quando um pedido é feito ou cancelado (inclusive em outra aba).
  useEffect(() => { loadMovs(); window.addEventListener(MOV_EVENT, loadMovs); window.addEventListener("storage", loadMovs); return () => { window.removeEventListener(MOV_EVENT, loadMovs); window.removeEventListener("storage", loadMovs); }; }, []);
  const [precos, setPrecos] = useState<Record<string, number>>({});
  useEffect(() => setPrecos(readExtraPrices()), []);

  const registrar = () => {
    if (!mov) return;
    const n = Math.max(1, Math.round(Number(qtd)));
    const novo = mov.tipo === "Entrada" ? mov.item.qtd + n : Math.max(0, mov.item.qtd - n);
    crud.update.mutate({ id: mov.item.id, qtd: novo }, { onSuccess: () => {
      appendMovimentos([{ id: Date.now(), estoque: mov.item.nome, estoque_id: mov.item.id, tipo: mov.tipo, qtd: n, dt: new Date().toISOString(), motivo }]);
      setMov(null); setQtd("1"); setMotivo("");
    } });
  };

  return (
    <>
      <PageHeader title="Estoque" subtitle={`Alerta quando um insumo fica abaixo de ${estoqueMinimo} unidades. "Preço do extra" é cobrado quando o cliente pede mais desse ingrediente.`}
        actions={<Button variant={onlyLow ? "default" : "outline"} onClick={() => setOnlyLow(!onlyLow)}>{onlyLow ? "Mostrando só estoque baixo" : "Filtrar estoque baixo"}</Button>} />
      <Tabs defaultValue="insumos" onValueChange={(v) => v === "hist" && loadMovs()}>
        <TabsList className="mb-4"><TabsTrigger value="insumos">Ingredientes</TabsTrigger><TabsTrigger value="fornecedores">Fornecedores</TabsTrigger><TabsTrigger value="hist">Movimentações</TabsTrigger></TabsList>
        <TabsContent value="insumos">
          <CrudTable resource="estoque" label="Ingrediente" filter={onlyLow ? (r) => r.qtd < estoqueMinimo : undefined} searchKeys={["nome", "unidade_medida"]} fields={[
            { key: "nome", label: "Ingrediente", required: true },
            { key: "qtd", label: "Quantidade", type: "number", step: "1", required: true, render: (r) => {
              const low = r.qtd < estoqueMinimo; const pct = Math.min(100, (r.qtd / (estoqueMinimo * 3)) * 100);
              return <div className="w-32"><div className="flex justify-between text-xs"><b className={low ? "text-destructive" : ""}>{r.qtd} {r.unidade_medida}</b>{low && <span className="font-semibold text-destructive">baixo</span>}</div>
                <div className="mt-1 h-1.5 rounded-full bg-muted"><div className={low ? "h-full rounded-full bg-destructive" : "h-full rounded-full bg-success"} style={{ width: `${pct}%` }} /></div></div>; } },
            { key: "unidade_medida", label: "Unidade", required: true, placeholder: "un, kg, g, L" },
            { key: "_extra", label: "Preço do extra", virtual: true, render: (r) => (
              <input key={`${r.id}-${precos[r.id] ?? 0}`} className="field h-8 w-24" type="number" step="0.01" min={0} placeholder="R$ 0,00" aria-label={`Preço do extra de ${r.nome}`}
                defaultValue={precos[r.id] ?? ""} title={precos[r.id] ? brl(precos[r.id]!) : "Grátis"}
                onBlur={(e) => { saveExtraPrice(r.id, Number(e.target.value) || 0); setPrecos(readExtraPrices()); }} />) },
            { key: "fornecedor_id", label: "Fornecedor", type: "select", required: true, options: forn.map((f) => ({ value: f.id, label: f.nome })) },
          ]} rowActions={(r) => <>
            <Button size="icon" variant="ghost" aria-label="Entrada" className="text-success" onClick={() => setMov({ item: r as Estoque, tipo: "Entrada" })}><ArrowDownToLine /></Button>
            <Button size="icon" variant="ghost" aria-label="Saída" className="text-primary" onClick={() => setMov({ item: r as Estoque, tipo: "Saída" })}><ArrowUpFromLine /></Button></>}
            hint={forn.length === 0 ? "Cadastre um fornecedor antes de adicionar ingredientes." : undefined} />
        </TabsContent>
        <TabsContent value="fornecedores">
          <CrudTable resource="fornecedor" label="Fornecedor" searchKeys={["nome", "contato"]} fields={[{ key: "nome", label: "Nome", required: true }, { key: "contato", label: "Contato", type: "phone", required: true, placeholder: "(00) 00000-0000" }]} />
        </TabsContent>
        <TabsContent value="hist">
          <Panel title="Histórico de movimentações" action={<History className="size-5 text-muted-foreground" />}>
            {movs.length === 0 ? <Empty title="Sem movimentações" hint="Use os botões de entrada e saída na lista de ingredientes." /> :
              <div className="divide-y">{movs.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="flex items-center gap-2">{m.tipo === "Entrada" ? <ArrowDownToLine className="size-4 text-success" /> : <ArrowUpFromLine className="size-4 text-primary" />}<b>{m.estoque}</b> {m.motivo && <span className="text-muted-foreground">· {m.motivo}</span>}</span>
                  <span className={m.tipo === "Entrada" ? "font-semibold text-success" : "font-semibold text-primary"}>{m.tipo === "Entrada" ? "+" : "−"}{m.qtd}</span>
                  <span className="text-xs text-muted-foreground">{new Date(m.dt).toLocaleString("pt-BR")}</span>
                </div>))}</div>}
          </Panel>
        </TabsContent>
      </Tabs>

      <Dialog open={!!mov} onOpenChange={(o) => !o && setMov(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{mov?.tipo} de estoque · {mov?.item.nome}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Atual: {mov?.item.qtd} {mov?.item.unidade_medida}</p>
          <label className="grid gap-1.5"><span className="text-sm font-medium">Quantidade</span><input className="field" type="number" min={1} value={qtd} onChange={(e) => setQtd(e.target.value)} /></label>
          <label className="grid gap-1.5"><span className="text-sm font-medium">Motivo</span><input className="field" placeholder="Compra, perda, uso…" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></label>
          <DialogFooter><Button onClick={registrar} disabled={crud.update.isPending}>Registrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
