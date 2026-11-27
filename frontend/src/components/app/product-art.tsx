import { Beef, CakeSlice, CupSoda, Drumstick, Pizza, Salad, Sandwich, Soup, IceCream } from "lucide-react";
import { cn } from "@/lib/utils";

const pick = (t: string) => {
  const s = t.toLowerCase();
  if (/refri|suco|bebida|coca|água|agua|milk|shake/.test(s)) return CupSoda;
  if (/sobremesa|doce|bolo|torta/.test(s)) return CakeSlice;
  if (/sorvete|açaí|acai/.test(s)) return IceCream;
  if (/pizza/.test(s)) return Pizza;
  if (/salada|veg/.test(s)) return Salad;
  if (/frango|nugget|asa/.test(s)) return Drumstick;
  if (/sopa|caldo/.test(s)) return Soup;
  if (/burg|x-|carne|bacon/.test(s)) return Beef;
  return Sandwich;
};
const tones = ["bg-secondary text-primary", "bg-muted text-secondary-foreground", "bg-accent text-accent-foreground"];

export function ProductArt({ name, category, className, small }: { name: string; category?: string; className?: string; small?: boolean }) {
  const Icon = pick(`${category ?? ""} ${name}`);
  const tone = tones[(name.length + (category?.length ?? 0)) % tones.length];
  return <div className={cn("grid shrink-0 place-items-center", tone, className)}><Icon className={small ? "size-4" : "size-8 opacity-70"} /></div>;
}
