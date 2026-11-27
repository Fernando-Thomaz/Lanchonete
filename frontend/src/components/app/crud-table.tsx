import { formatPhone } from "@/lib/utils";
import { useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCrud, useList, type Resource, type Row } from "@/lib/api";
import { Empty, ErrorState, Loading, Panel } from "./ui-bits";

export type FieldType = "text" | "number" | "date" | "datetime" | "bool" | "select" | "textarea" | "phone";
export interface Field {
  key: string; label: string; type?: FieldType; required?: boolean;
  options?: { value: string | number; label: string }[]; step?: string;
  render?: (row: Row) => ReactNode; hideInTable?: boolean; virtual?: boolean; placeholder?: string; formOnly?: boolean;
}

function toInput(f: Field, v: any) {
  if (v == null) return f.type === "bool" ? false : "";
  if (f.type === "date") return String(v).slice(0, 10);
  if (f.type === "datetime") return String(v).slice(0, 16);
  return v;
}
function fromInput(f: Field, v: any) {
  if (f.type === "bool") return !!v;
  if (v === "" || v == null) return null;
  if (f.type === "number") return Number(v);
  if (f.type === "select") return isNaN(Number(v)) ? v : Number(v);
  if (f.type === "datetime") return new Date(v).toISOString();
  return v;
}

export function CrudForm({ fields, initial, onSubmit, submitting, submitLabel = "Salvar" }: { fields: Field[]; initial?: Row | null; onSubmit: (v: Record<string, any>) => void; submitting?: boolean; submitLabel?: string }) {
  const [vals, setVals] = useState<Record<string, any>>(() => Object.fromEntries(fields.map((f) => [f.key, toInput(f, initial?.[f.key])])));
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit(Object.fromEntries(fields.map((f) => [f.key, fromInput(f, vals[f.key])]))); }}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className={f.type === "textarea" ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"}>
            <span className="text-sm font-medium">{f.label}{f.required && <span className="text-primary"> *</span>}</span>
            {f.type === "bool" ? (
              <span className="flex h-10 items-center gap-2"><input type="checkbox" className="size-4 accent-primary" checked={!!vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.checked })} /> Sim</span>
            ) : f.type === "select" ? (
              <select className="field" required={f.required} value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}>
                <option value="">Selecione…</option>
                {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === "textarea" ? (
              <textarea className="field h-24 py-2" value={vals[f.key]} placeholder={f.placeholder} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
            ) : (
              <input className="field" required={f.required} placeholder={f.placeholder} step={f.step ?? (f.type === "number" ? "any" : undefined)}
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : "text"}
                inputMode={f.type === "phone" ? "tel" : undefined}
                value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: f.type === "phone" ? formatPhone(e.target.value) : e.target.value })} />
            )}
          </label>
        ))}
      </div>
      <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? "Salvando…" : submitLabel}</Button></DialogFooter>
    </form>
  );
}

export function CrudTable({ resource, label, title, fields, searchKeys = ["nome"], rowActions, filter, hint, onSaved, initialFor, onOpenForm }: {
  resource: Resource; label: string; title?: string; fields: Field[]; searchKeys?: string[];
  rowActions?: (row: Row) => ReactNode; filter?: (row: Row) => boolean; hint?: string;
  onOpenForm?: (row: Row | null) => void;
  initialFor?: (row: Row) => Row;
  onSaved?: (id: number, values: Record<string, any>, isNew: boolean, previous?: Row | null) => void | Promise<void>;
}) {
  const q = useList(resource);
  const crud = useCrud(resource, label);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const open = (r: Row | null) => (onOpenForm ? onOpenForm(r) : setEditing(r));

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (q.data ?? []).filter((r) => (!filter || filter(r)) && (!s || [String(r.id), ...searchKeys.map((k) => String(r[k] ?? ""))].some((v) => v.toLowerCase().includes(s))));
  }, [q.data, search, filter, searchKeys]);

  const cols = fields.filter((f) => !f.hideInTable && !f.formOnly);
  const cell = (f: Field, r: Row) => {
    if (f.render) return f.render(r);
    const v = r[f.key];
    if (f.type === "bool") return v ? "Sim" : "Não";
    if (f.type === "select") return f.options?.find((o) => String(o.value) === String(v))?.label ?? (v ?? "—");
    if (f.type === "date" || f.type === "datetime") return v ? new Date(String(v).length === 10 ? v + "T00:00" : v).toLocaleDateString("pt-BR") : "—";
    return v ?? "—";
  };

  return (
    <Panel title={title} action={
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <div className="relative min-w-0 flex-1 sm:flex-none"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input className="field pl-9 sm:w-52" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Button onClick={() => open(null)}><Plus /> Novo</Button>
      </div>}>
      {hint && <p className="-mt-2 mb-3 text-sm text-muted-foreground">{hint}</p>}
      {q.isLoading ? <Loading /> : q.error ? <ErrorState error={q.error as Error} onRetry={() => q.refetch()} /> : rows.length === 0 ? (
        <Empty title={search ? "Nenhum resultado" : `Nenhum ${label.toLowerCase()} cadastrado`} hint={search ? "Tente outro termo de busca." : "Comece adicionando o primeiro."}
          action={!search && <Button className="mt-3" onClick={() => open(null)}><Plus /> Adicionar {label.toLowerCase()}</Button>} />
      ) : (
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="w-full min-w-[560px] whitespace-nowrap text-sm">
            <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-semibold sm:px-5">#</th>
              {cols.map((f) => <th key={f.key} className="px-3 py-2 font-semibold">{f.label}</th>)}
              <th className="px-4 py-2 text-right font-semibold sm:px-5">Ações</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 transition-colors hover:bg-muted/60">
                  <td className="px-4 py-3 font-mono text-xs sm:px-5 text-muted-foreground">{r.id}</td>
                  {cols.map((f) => <td key={f.key} className="px-3 py-3">{cell(f, r)}</td>)}
                  <td className="px-4 py-3 sm:px-5"><div className="flex justify-end gap-1">
                    {rowActions?.(r)}
                    <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => open(r)}><Pencil /></Button>
                    <Button size="icon" variant="ghost" aria-label="Excluir" className="text-destructive" onClick={() => setDeleting(r)}><Trash2 /></Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing ? `Editar ${label.toLowerCase()} #${editing.id}` : `Novo ${label.toLowerCase()}`}</DialogTitle></DialogHeader>
          {editing !== undefined && (
            <CrudForm key={editing?.id ?? "new"} fields={fields.filter((f) => !f.virtual)} initial={editing && initialFor ? initialFor(editing) : editing} submitting={crud.create.isPending || crud.update.isPending}
              onSubmit={(v) => {
                const body = Object.fromEntries(Object.entries(v).filter(([k]) => !fields.find((f) => f.key === k)?.formOnly));
                const prev = editing;
                if (prev) crud.update.mutate({ id: prev.id, ...body }, { onSuccess: async () => { setEditing(undefined); await onSaved?.(prev.id, v, false, prev); } });
                else crud.create.mutate(body, { onSuccess: async (r) => { setEditing(undefined); await onSaved?.(r.id, v, true); } });
              }} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir {label.toLowerCase()} #{deleting?.id}?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleting && crud.remove.mutate(deleting.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
