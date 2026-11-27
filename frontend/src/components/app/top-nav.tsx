import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bike, Boxes, ClipboardList, LayoutDashboard, Menu, Moon, Percent, Settings, Sofa, Sun, UserCog, Users, UtensilsCrossed } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Menu principal: somente estas abas.
const principais = [
  { title: "Início", url: "/", icon: LayoutDashboard },
  { title: "Pedidos", url: "/pedidos", icon: ClipboardList },
  { title: "Mesas", url: "/mesas", icon: Sofa },
  { title: "Cardápio", url: "/cardapio", icon: UtensilsCrossed },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Ajustes", url: "/configuracoes", icon: Settings },
] as const;

// Telas secundárias: ficam apenas no menu hambúrguer.
const secundarias = [
  { title: "Entregas", url: "/entregas", icon: Bike },
  { title: "Promoções", url: "/promocoes", icon: Percent },
  { title: "Estoque", url: "/estoque", icon: Boxes },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Equipe", url: "/funcionarios", icon: UserCog },
] as const;

const isActive = (path: string, url: string) => path === url || (url === "/pedidos" && path === "/novo-pedido");

/** Cabeçalho fixo com as abas principais (telas grandes) e menu hambúrguer. */
export function TopNav() {
  const { nome } = useSettings();
  const path = useRouterState({ select: (r) => r.location.pathname });
  useEffect(() => {
    const t = setTimeout(() => { if (nome && document.title.includes("Sabor & Cia")) document.title = document.title.replaceAll("Sabor & Cia", nome); }, 50);
    return () => clearTimeout(t);
  }, [path, nome]);

  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* ignore */ }
  };

  const [open, setOpen] = useState(false);
  const drawerLink = (i: (typeof principais)[number] | (typeof secundarias)[number]) => (
    <Link key={i.url} to={i.url} onClick={() => setOpen(false)} aria-current={isActive(path, i.url) ? "page" : undefined}
      className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", isActive(path, i.url) ? "bg-foreground text-background" : "hover:bg-accent")}>
      <i.icon className="size-5" />{i.title}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 md:px-8">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button type="button" aria-label="Abrir menu" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card transition-colors hover:bg-accent">
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" aria-describedby={undefined} className="flex w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto p-4">
            <SheetTitle className="mb-3 truncate px-3 pr-8">{nome}</SheetTitle>
            <nav aria-label="Menu" className="flex flex-col gap-1">
              {principais.map(drawerLink)}
              <p className="mt-3 border-t border-border px-3 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mais opções</p>
              {secundarias.map(drawerLink)}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="min-w-0 truncate text-[17px] font-semibold tracking-tight">{nome}</Link>

        <nav aria-label="Menu principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {principais.map((i) => (
            <Link key={i.url} to={i.url} aria-current={isActive(path, i.url) ? "page" : undefined}
              className={cn("flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors", isActive(path, i.url) ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              <i.icon className="hidden size-4 xl:block" />{i.title}
            </Link>
          ))}
        </nav>

        <button type="button" onClick={toggleTheme} aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"} title={dark ? "Modo claro" : "Modo escuro"} className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent lg:ml-2">
          {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>
      </div>
    </header>
  );
}
