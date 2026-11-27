import { useEffect } from "react";
import { useSettings } from "@/lib/settings";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bike, Boxes, ClipboardList, Flame, LayoutDashboard, Percent, PlusCircle, Settings, Sofa, UserCog, Users, UtensilsCrossed } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

const groups = [
  { label: "Operação", items: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Novo pedido", url: "/novo-pedido", icon: PlusCircle },
    { title: "Pedidos", url: "/pedidos", icon: ClipboardList },
    { title: "Mesas", url: "/mesas", icon: Sofa },
    { title: "Entregas", url: "/entregas", icon: Bike },
  ] },
  { label: "Gestão", items: [
    { title: "Cardápio", url: "/cardapio", icon: UtensilsCrossed },
    { title: "Promoções e cupons", url: "/promocoes", icon: Percent },
    { title: "Estoque", url: "/estoque", icon: Boxes },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: "Funcionários", url: "/funcionarios", icon: UserCog },
  ] },
  { label: "Análise", items: [
    { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
    { title: "Configurações", url: "/configuracoes", icon: Settings },
  ] },
] as const;

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { nome } = useSettings();
  const path = useRouterState({ select: (r) => r.location.pathname });
  useEffect(() => { const t = setTimeout(() => { if (nome && document.title.includes("Sabor & Cia")) document.title = document.title.replaceAll("Sabor & Cia", nome); }, 50); return () => clearTimeout(t); }, [path, nome]);
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-flame text-primary-foreground shadow-flame"><Flame className="size-5" /></span>
          {!collapsed && <div className="leading-tight"><p className="font-display text-lg font-bold">{nome}</p><p className="text-xs text-sidebar-foreground/60">Gestão da lanchonete</p></div>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/50">{g.label}</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>
              {g.items.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={path === i.url} tooltip={i.title}
                    className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground">
                    <Link to={i.url} onClick={() => setOpenMobile(false)}><i.icon /><span>{i.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>{!collapsed && <p className="px-2 pb-2 text-xs text-sidebar-foreground/50">Conectado à API {nome}</p>}</SidebarFooter>
    </Sidebar>
  );
}
