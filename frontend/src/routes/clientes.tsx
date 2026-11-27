import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CrudTable } from "@/components/app/crud-table";
import { PageHeader, StatusBadge } from "@/components/app/ui-bits";
import { api, brl, fmtDate, useList, type Cliente, type ClienteEndereco, type Endereco } from "@/lib/api";
import { useOrders } from "@/lib/orders";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/clientes")({
  head: () => seo("Clientes", "Cadastro de clientes, endereços e histórico de pedidos."),
  component: ClientesPage,
});

function ClientesPage() {
  const { orders } = useOrders();
  const clientes = useList<Cliente>("cliente").data ?? [];
  const ends = useList<Endereco>("endereco").data ?? [];
  const links = useList<ClienteEndereco>("cliente_has_endereco").data ?? [];
  const [view, setView] = useState<Cliente | null>(null);
  const [endFor, setEndFor] = useState<number | null>(null);
  const stats = (id: number) => {
    const os = orders.filter((o) => o.pedido.cliente_id === id && o.status !== "Cancelado");
    return { qtd: os.length, gasto: os.reduce((s, o) => s + o.total, 0), ultimo: os.map((o) => o.criado).filter(Boolean).sort().at(-1) ?? null };
  };
  const endLabel = (e?: Endereco) => (e ? `${e.rua}, ${e.numero}${e.bairro ? ` – ${e.bairro}` : ""}` : "—");
  const endsOf = (id: number) => links.filter((l) => l.cliente_id === id).map((l) => ends.find((e) => e.id === l.endereco_id)).filter(Boolean) as Endereco[];

  return (
    <>
      <PageHeader title="Clientes" subtitle="Quem volta sempre merece ser lembrado." />
      <Tabs defaultValue="clientes">
        <TabsList className="mb-4"><TabsTrigger value="clientes">Clientes</TabsTrigger><TabsTrigger value="enderecos">Endereços</TabsTrigger><TabsTrigger value="vinculos">Endereços por cliente</TabsTrigger></TabsList>
        <TabsContent value="clientes">
          <CrudTable resource="cliente" label="Cliente" searchKeys={["nome", "contato"]} fields={[
            { key: "nome", label: "Nome", required: true },
            { key: "contato", label: "Telefone", type: "phone", required: true, placeholder: "(00) 00000-0000" },
            { key: "_end", label: "Endereço", virtual: true, render: (r) => <span className="text-muted-foreground">{endLabel(endsOf(r.id)[0])}</span> },
            { key: "_gasto", label: "Gasto", virtual: true, render: (r) => brl(stats(r.id).gasto) },
            { key: "_ult", label: "Último pedido", virtual: true, render: (r) => fmtDate(stats(r.id).ultimo) },
          ]}
            onSaved={(id, _v, isNew) => { if (isNew) setEndFor(id); }}
            rowActions={(r) => <><Button size="icon" variant="ghost" aria-label="Adicionar endereço" onClick={() => setEndFor(r.id)}><MapPin /></Button><Button size="icon" variant="ghost" aria-label="Ver detalhes" onClick={() => setView(r as Cliente)}><Eye /></Button></>} />
        </TabsContent>
        <TabsContent value="enderecos">
          <CrudTable resource="endereco" label="Endereço" searchKeys={["rua", "bairro", "cep"]} fields={[
            { key: "rua", label: "Rua", required: true }, { key: "numero", label: "Número", type: "number", step: "1", required: true },
            { key: "bairro", label: "Bairro" }, { key: "cep", label: "CEP", required: true },
          ]} />
        </TabsContent>
        <TabsContent value="vinculos">
          <CrudTable resource="cliente_has_endereco" label="Vínculo" searchKeys={[]} fields={[
            { key: "cliente_id", label: "Cliente", type: "select", required: true, options: clientes.map((c) => ({ value: c.id, label: c.nome })) },
            { key: "endereco_id", label: "Endereço", type: "select", required: true, options: ends.map((e) => ({ value: e.id, label: endLabel(e) })) },
          ]} />
        </TabsContent>
      </Tabs>

      <AddressStep clienteId={endFor} nome={clientes.find((c) => c.id === endFor)?.nome} onClose={() => setEndFor(null)} />
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{view?.nome}</DialogTitle></DialogHeader>
          {view && (() => { const s = stats(view.id); const os = orders.filter((o) => o.pedido.cliente_id === view.id); return (
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">{view.contato}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["Pedidos", s.qtd], ["Gasto", brl(s.gasto)], ["Último", fmtDate(s.ultimo)]].map(([l, v]) => <div key={l as string} className="rounded-xl bg-secondary p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="font-bold">{v}</p></div>)}
              </div>
              <div>{endsOf(view.id).map((e) => <p key={e.id} className="flex items-center gap-2 text-sm"><MapPin className="size-4 text-primary" />{endLabel(e)} · {e.cep}</p>)}</div>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {os.length === 0 ? <p className="text-sm text-muted-foreground">Sem pedidos ainda.</p> : os.map((o) => (
                  <div key={o.pedido.id} className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>#{o.pedido.id} · {fmtDate(o.criado)}</span><StatusBadge status={o.status} /><b>{brl(o.total)}</b></div>))}
              </div>
            </div>); })()}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AddressStep({ clienteId, nome, onClose }: { clienteId: number | null; nome?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const blank = { rua: "", numero: "", bairro: "", cep: "" };
  const [f, setF] = useState(blank); const [busy, setBusy] = useState(false);
  const close = () => { setF(blank); onClose(); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!clienteId) return; setBusy(true);
    try {
      const en = await api.create("endereco", { rua: f.rua, numero: Number(f.numero), bairro: f.bairro || null, cep: f.cep });
      await api.create("cliente_has_endereco", { cliente_id: clienteId, endereco_id: en.id });
      await qc.invalidateQueries(); toast.success("Endereço adicionado"); close();
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  };
  const inp = (k: keyof typeof f, ph: string, req = true, type = "text") => <input className="field" type={type} placeholder={ph} required={req} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />;
  return (
    <Dialog open={clienteId !== null} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Passo 2 · Endereço{nome ? ` de ${nome}` : ""}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-2">
          <div className="grid grid-cols-[1fr_90px] gap-2">{inp("rua", "Rua *")}{inp("numero", "Nº *", true, "number")}</div>
          <div className="grid grid-cols-2 gap-2">{inp("bairro", "Bairro", false)}{inp("cep", "CEP *")}</div>
          <div className="mt-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Pular</Button><Button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar endereço"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
