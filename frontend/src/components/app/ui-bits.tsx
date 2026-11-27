import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { statusTone } from "@/lib/orders";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 max-sm:w-full [&>*]:max-sm:flex-1">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl bg-card p-5 shadow-soft sm:p-7", className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, icon: Icon, hint, tone = "default" }: { label: string; value: ReactNode; icon: any; hint?: string; tone?: "default" | "flame" | "mustard" }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl p-5 shadow-soft sm:p-6",
      tone === "flame" ? "bg-foreground text-background" : tone === "mustard" ? "bg-secondary" : "bg-card")}>
      <div className="flex items-start justify-between">
        <p className={cn("text-sm font-medium", tone === "default" && "text-muted-foreground")}>{label}</p>
        <Icon className={cn("size-5", tone === "default" ? "text-muted-foreground" : "opacity-80")} />
      </div>
      <p className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{value}</p>
      {hint && <p className={cn("mt-1 text-xs", tone === "default" ? "text-muted-foreground" : "opacity-85")}>{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", statusTone[status] ?? "bg-muted text-muted-foreground")}>{status}</span>;
}

export function Loading({ label = "Carregando dados da lanchonete…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
      <p className="text-xs">O servidor pode levar alguns segundos para acordar.</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <AlertTriangle className="size-9 text-destructive" />
      <p className="font-semibold">Não foi possível falar com o servidor</p>
      <p className="max-w-sm text-sm text-muted-foreground">{error.message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}><RefreshCw /> Tentar de novo</Button>}
    </div>
  );
}

export function Empty({ title = "Nada por aqui ainda", hint, action }: { title?: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Inbox className="size-7" /></span>
      <p className="mt-2 font-semibold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}
