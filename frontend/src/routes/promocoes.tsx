import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudTable } from "@/components/app/crud-table";
import { PageHeader } from "@/components/app/ui-bits";
import { useList, type Cardapio, type Promocao } from "@/lib/api";
import { seo } from "@/lib/seo";
import { CuponsTable, promoStatus } from "@/components/app/cupons";

export const Route = createFileRoute("/promocoes")({
  head: () => seo("Promoções e cupons", "Promoções sazonais e cupons de desconto."),
  component: PromosPage,
});


function PromosPage() {
  const prods = useList<Cardapio>("cardapio").data ?? [];
  return (
    <>
      <PageHeader title="Promoções e cupons" subtitle="Ofertas que enchem o balcão." />
      <Tabs defaultValue="promo">
        <TabsList className="mb-4"><TabsTrigger value="promo">Promoções</TabsTrigger><TabsTrigger value="cupons">Cupons</TabsTrigger></TabsList>
        <TabsContent value="promo" className="grid gap-4">
          <CrudTable resource="promocao" label="Promoção" filter={(r) => r.nome !== "Sem promoção"} fields={[
            { key: "nome", label: "Nome", required: true },
            { key: "valor_percentual", label: "Desconto (%)", type: "number", required: true, render: (r) => `${r.valor_percentual}%` },
            { key: "dt_inicio", label: "Início", type: "date", required: true },
            { key: "dt_final", label: "Término", type: "date", required: true },
          ]} rowActions={(r) => <span className="mr-2 self-center rounded-full bg-secondary px-2 py-1 text-xs font-semibold">{promoStatus(r as Promocao)} · {prods.filter((p) => p.promocao_id === r.id).length} produtos</span>} />
          <p className="text-sm text-muted-foreground">Para incluir produtos numa promoção, edite o produto no Cardápio e escolha a promoção.</p>
        </TabsContent>
        <TabsContent value="cupons"><CuponsTable /></TabsContent>
      </Tabs>
    </>
  );
}

