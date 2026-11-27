import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudTable } from "@/components/app/crud-table";
import { PageHeader } from "@/components/app/ui-bits";
import { api, fmtDate, useList, type StatusCargo, type Trabalhador } from "@/lib/api";
import { seo } from "@/lib/seo";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/funcionarios")({
  head: () => seo("Funcionários", "Equipe, cargos e histórico de funções."),
  component: FuncPage,
});

function FuncPage() {
  const trab = useList<Trabalhador>("trabalhador").data ?? [];
  const cargos = useList<StatusCargo>("status_cargo").data ?? [];
  const atual = (id: number) => cargos.filter((c) => c.trabalhador_id === id).sort((a, b) => a.dt_inicio.localeCompare(b.dt_inicio)).at(-1);
  const ativo = (c?: StatusCargo) => !!c && new Date(c.dt_final) > new Date();
  const qc = useQueryClient();
  const syncCargo = async (id: number, v: Record<string, any>, isNew: boolean) => {
    const cargo = String(v._novo_cargo ?? "").trim(); if (!cargo) return;
    const cur = atual(id); const now = new Date().toISOString();
    if (!isNew && cur?.cargo === cargo && ativo(cur)) return;
    try {
      if (cur && ativo(cur)) await api.update("status_cargo", cur.id, { dt_final: now });
      await api.create("status_cargo", { trabalhador_id: id, cargo, dt_inicio: now, dt_final: "2099-12-31T23:59:00.000Z" });
      await qc.invalidateQueries({ queryKey: ["status_cargo"] }); toast.success(`Função registrada: ${cargo}`);
    } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHeader title="Funcionários" subtitle="A equipe que faz a chapa girar." />
      <Tabs defaultValue="equipe">
        <TabsList className="mb-4"><TabsTrigger value="equipe">Equipe</TabsTrigger><TabsTrigger value="cargos">Histórico de funções</TabsTrigger></TabsList>
        <TabsContent value="equipe">
          <CrudTable resource="trabalhador" label="Funcionário" searchKeys={["nome", "contato"]} fields={[
            { key: "nome", label: "Nome", required: true },
            { key: "contato", label: "Contato", type: "phone", required: true, placeholder: "(00) 00000-0000" },
            { key: "_novo_cargo", label: "Cargo", formOnly: true, required: true, placeholder: "Chapeiro, Atendente, Entregador…" },
            { key: "_cargo", label: "Cargo atual", virtual: true, render: (r) => atual(r.id)?.cargo ?? "—" },
            { key: "_status", label: "Status", virtual: true, render: (r) => { const a = ativo(atual(r.id)); return <span className={a ? "rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success" : "rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground"}>{a ? "Ativo" : "Inativo"}</span>; } },
          ]} initialFor={(r) => ({ ...r, _novo_cargo: ativo(atual(r.id)) ? atual(r.id)?.cargo : "" })} onSaved={syncCargo} />
        </TabsContent>
        <TabsContent value="cargos">
          <CrudTable resource="status_cargo" label="Função" searchKeys={["cargo"]} fields={[
            { key: "trabalhador_id", label: "Funcionário", type: "select", required: true, options: trab.map((t) => ({ value: t.id, label: t.nome })) },
            { key: "cargo", label: "Cargo", required: true, placeholder: "Chapeiro, Atendente, Entregador…" },
            { key: "dt_inicio", label: "Início", type: "datetime", required: true, render: (r) => fmtDate(r.dt_inicio) },
            { key: "dt_final", label: "Término", type: "datetime", required: true, render: (r) => fmtDate(r.dt_final) },
          ]} hint="Preenchido automaticamente ao cadastrar um funcionário ou mudar o cargo dele. Você ainda pode ajustar manualmente." />
        </TabsContent>
      </Tabs>
    </>
  );
}
