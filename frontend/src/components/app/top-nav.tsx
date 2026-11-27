import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bike, Boxes, ClipboardList, LayoutDashboard, Moon, Percent, Plus, Settings, Sofa, Sun, UserCog, Users, UtensilsCrossed } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const groups = [
  [
    { title: "Início", url: "/", icon: LayoutDashboard },
    { title: "Pedidos", url: "/pedidos", icon: ClipboardList },
    { title: "Mesas", url: "/mesas", icon: Sofa },
    { title: "Entregas", url: "/entregas", icon: Bike },
  ],
  [
    { title: "Cardápio", url: "/cardapio", icon: UtensilsCrossed },
    { title: "Promoções", url: "/promocoes", icon: Percent },
    { title: "Estoque", url: "/estoque", icon: Boxes },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: "Equipe", url: "/funcionarios", icon: UserCog },
  ],
  [
    { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
    { title: "Ajustes", url: "/configuracoes", icon: Settings },
  ],
] as const;

/** Topo discreto (marca + data) e navegação em dock flutuante, centralizada na base da tela. */
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

  return (
    <>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-6 md:px-8">
        <Link to="/" className="text-[17px] font-semibold tracking-tight">{nome}</Link>
        <div className="flex items-center gap-3">
        <span suppressHydrationWarning className="text-sm capitalize text-muted-foreground">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</span>
          <button type="button" onClick={toggleTheme} aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"} title={dark ? "Modo claro" : "Modo escuro"} className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent">
            {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>
        </div>
      </header>

      <nav aria-label="Seções" className="fixed bottom-4 left-1/2 z-30 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-0.5 overflow-x-auto rounded-[26px] border border-border bg-card/80 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl backdrop-saturate-150 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link to="/novo-pedido" className={cn("mr-1 flex min-w-[60px] shrink-0 flex-col items-center gap-1 rounded-[18px] bg-primary px-1 py-2 text-[10.5px] font-semibold text-primary-foreground transition hover:opacity-90", path === "/novo-pedido" && "ring-2 ring-ring ring-offset-2 ring-offset-card")}>
          <Plus className="size-[21px]" /> Novo
        </Link>
        {groups.map((g, gi) => (
          <div key={gi} className="flex shrink-0 items-center gap-0.5">
            <span aria-hidden className="mx-1.5 h-8 w-px bg-border" />
            {g.map((i) => (
              <Link key={i.url} to={i.url} className={cn("flex min-w-[60px] shrink-0 flex-col items-center gap-1 rounded-[18px] px-1 py-2 text-[10.5px] font-medium transition-colors", path === i.url ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                <i.icon className="size-[21px]" />{i.title}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
}
