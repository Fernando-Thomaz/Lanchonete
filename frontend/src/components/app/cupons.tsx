import { CrudTable } from "./crud-table";
import type { Promocao } from "@/lib/api";

const today = () => new Date().toISOString().slice(0, 10);
export const promoStatus = (p: Promocao) => (today() < p.dt_inicio ? "Agendada" : today() > p.dt_final ? "Encerrada" : "Ativa");

export function CuponsTable() {
  return <CrudTable resource="cupom" label="Cupom" fields={[
    { key: "nome", label: "Código", required: true, render: (r) => <span className="rounded-md bg-secondary px-2 py-1 font-mono font-semibold">{r.nome}</span> },
    { key: "valor_percentual", label: "Desconto (%)", type: "number", required: true, render: (r) => `${r.valor_percentual}%` },
    { key: "validade", label: "Validade", type: "date", required: true },
  ]} />;
}
