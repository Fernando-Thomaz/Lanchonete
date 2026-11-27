import { useEffect, useState } from "react";

export interface Settings { nome: string; telefone: string; endereco: string; taxaEntrega: number; estoqueMinimo: number; mesasAuto: boolean }
const DEFAULT: Settings = { nome: "Sabor & Cia", telefone: "(11) 4002-8922", endereco: "Rua das Brasas, 120 – Centro", taxaEntrega: 7, estoqueMinimo: 10, mesasAuto: true };
const KEY = "saborcia.settings";
const listeners = new Set<(s: Settings) => void>();

export function readSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT;
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return DEFAULT; }
}
export function saveSettings(s: Settings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  listeners.forEach((l) => l(s));
}
export function useSettings() {
  const [s, setS] = useState<Settings>(DEFAULT);
  useEffect(() => { setS(readSettings()); listeners.add(setS); return () => { listeners.delete(setS); }; }, []);
  return s;
}
