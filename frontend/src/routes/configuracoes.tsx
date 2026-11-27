import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/app/ui-bits";
import { API_URL } from "@/lib/api";
import { readSettings, saveSettings, type Settings } from "@/lib/settings";
import { seo } from "@/lib/seo";
import { formatPhone } from "@/lib/utils";

export const Route = createFileRoute("/configuracoes")({
  head: () => seo("Configurações", "Dados da lanchonete, taxa de entrega e alerta de estoque baixo."),
  component: Config,
});

function Config() {
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => setS(readSettings()), []);
  const f = (k: keyof Settings, label: string, type = "text") => s && (
    <label className="grid gap-1.5"><span className="text-sm font-medium">{label}</span>
      <input className="field" type={type} step="0.01" value={String(s[k])} onChange={(e) => setS({ ...s, [k]: type === "number" ? Number(e.target.value) : k === "telefone" ? formatPhone(e.target.value) : e.target.value })} /></label>);
  return (
    <>
      <PageHeader title="Configurações" subtitle="Ajuste a casa do seu jeito." />
      <form onSubmit={(e) => { e.preventDefault(); if (s) { saveSettings(s); toast.success("Configurações salvas"); } }} className="grid gap-6 lg:grid-cols-2">
        <Panel title="Informações da lanchonete"><div className="grid gap-3">{f("nome", "Nome")}{f("telefone", "Telefone")}{f("endereco", "Endereço")}</div></Panel>
        <Panel title="Operação"><div className="grid gap-3">{f("taxaEntrega", "Taxa de entrega (R$)", "number")}{f("estoqueMinimo", "Alerta de estoque baixo abaixo de", "number")}
          <p className="text-xs text-muted-foreground">Servidor de dados: {API_URL}</p></div></Panel>
        <div className="lg:col-span-2"><Button type="submit">Salvar configurações</Button></div>
      </form>
    </>
  );
}
