import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const API_URL = "https://lanchonete-gkqk.onrender.com";

export type Resource =
  | "avaliacao" | "cardapio" | "cardapio_has_estoque" | "categoria" | "cliente"
  | "cliente_has_endereco" | "cupom" | "endereco" | "estoque" | "fornecedor"
  | "is_combo" | "mesa" | "pagamento" | "pedido" | "promocao" | "status_cargo"
  | "status_pedido" | "trabalhador" | "trabalhador_has_pedido";

export type Row = { id: number } & Record<string, any>;

export interface Categoria { id: number; nome: string }
export interface Cardapio { id: number; nome: string; preco_base: number; categoria_id: number; promocao_id: number | null }
export interface Cliente { id: number; nome: string; contato: string }
export interface Endereco { id: number; rua: string; numero: number; cep: string; bairro: string | null }
export interface ClienteEndereco { id: number; cliente_id: number; endereco_id: number }
export interface Cupom { id: number; nome: string; valor_percentual: number; validade: string }
export interface Estoque { id: number; nome: string; qtd: number; unidade_medida: string; fornecedor_id: number }
export interface Fornecedor { id: number; nome: string; contato: string }
export interface Mesa { id: number; numero: number; qtd_cadeira: number; ocupada: boolean }
export interface Pagamento { id: number; dinheiro: number | null; pix: number | null; cartao: number | null }
export interface Pedido {
  id: number; tipo_pedido: string; tipo_entrega: string; varicao_pedido: string | null;
  adicional_pedido: string | null; observacao_pedido: string | null; cliente_id: number | null;
  mesa_id: number | null; cupom_id: number | null; avaliacao_id: number | null; pagamento_id: number;
}
export interface Promocao { id: number; nome: string; dt_inicio: string; dt_final: string; valor_percentual: number }
export interface StatusPedido { id: number; status_pedido: string; dt: string; pedido_id: number }
export interface Trabalhador { id: number; nome: string; contato: string }
export interface StatusCargo { id: number; cargo: string; dt_inicio: string; dt_final: string; trabalhador_id: number }
export interface ItemPedido { id: number; cardapio_id: number; pedido_id: number }
export interface CardapioEstoque { id: number; cardapio_id: number; estoque_id: number; qtd: number }
export interface TrabPedido { id: number; trabalhador_id: number; pedido_id: number }

function friendly(d: string) {
  const nn = d.match(/NOT NULL constraint failed: \w+\.(\w+)/);
  if (nn) return `O servidor exige o campo "${nn[1]}".`;
  if (/FOREIGN KEY/i.test(d)) return "Registro ligado a outro que não existe ou ainda está em uso.";
  return d.length > 200 ? d.slice(0, 200) + "…" : d;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The hosted API sleeps when idle, so cold starts answer 502/503/504 or drop the connection for a while. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  // Retrying a POST could create duplicates; GET/PUT/DELETE are safe to repeat.
  const attempts = method === "POST" ? 1 : 3;
  let res!: Response;
  let text = "";
  for (let i = 0; i < attempts; i++) {
    try {
      res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      });
      text = await res.text();
      if (![502, 503, 504].includes(res.status) || i === attempts - 1) break;
    } catch (e) {
      if (i === attempts - 1) throw new Error("Não foi possível falar com o servidor. Tente novamente em instantes.");
    }
    await sleep(1500 * (i + 1));
  }
  let data: any = null;
  if (text) {
    try { data = JSON.parse(text); }
    catch { if (res.ok) throw new Error("Resposta inválida do servidor."); }
  }
  // The API sometimes answers 200 with an error body ({ status_code: 500, detail }).
  const failed = !res.ok || (data && typeof data === "object" && !Array.isArray(data) && Number(data.status_code) >= 400);
  if (failed) {
    const detail = data?.detail;
    const msg = Array.isArray(detail)
      ? detail.map((d: any) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join("; ")
      : typeof detail === "string" ? friendly(detail) : `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  list: <T = Row>(r: Resource) => request<T[]>(`/${r}/list`),
  create: (r: Resource, body: object) =>
    request<{ id: number; mensagem: string }>(`/${r}/create`, { method: "POST", body: JSON.stringify(body) }),
  // The API overwrites every column on update, so merge partial changes into the current row first.
  // Pass `current` when the row was just fetched, to skip re-downloading the whole table.
  update: async (r: Resource, id: number, body: object, current?: Row) => {
    const cur = current ?? (await request<Row[]>(`/${r}/list`)).find((x) => x.id === id);
    if (!cur) throw new Error("Registro não encontrado. Atualize a página e tente de novo.");
    const { id: _id, ...merged } = { ...cur, ...body } as Row;
    // Only plain columns go back to the server; nested objects/lists are relations it did not ask for.
    const rest = Object.fromEntries(Object.entries(merged).filter(([, v]) => v === null || typeof v !== "object"));
    return request(`/${r}/update/${id}`, { method: "PUT", body: JSON.stringify(rest) });
  },
  remove: (r: Resource, id: number) => request(`/${r}/delete/${id}`, { method: "DELETE" }),
};

export function useList<T = Row>(r: Resource) {
  return useQuery({ queryKey: [r], queryFn: () => api.list<T>(r), staleTime: 15_000, retry: 2 });
}

export function useCrud(r: Resource, label = "Registro") {
  const qc = useQueryClient();
  const done = (msg: string) => () => { qc.invalidateQueries({ queryKey: [r] }); toast.success(msg); };
  const fail = (e: Error) => toast.error(e.message || "Falha na operação");
  return {
    create: useMutation({ mutationFn: (b: object) => api.create(r, b), onSuccess: done(`${label} criado`), onError: fail }),
    update: useMutation({ mutationFn: ({ id, ...b }: { id: number } & Record<string, any>) => api.update(r, id, b), onSuccess: done(`${label} atualizado`), onError: fail }),
    remove: useMutation({ mutationFn: (id: number) => api.remove(r, id), onSuccess: done(`${label} excluído`), onError: fail }),
  };
}

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtDate = (s?: string | null) => (s ? new Date(s.length === 10 ? s + "T00:00" : s).toLocaleDateString("pt-BR") : "—");
export const fmtTime = (s?: string | null) => (s ? new Date(s).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—");

/** The server rejects products without a promotion; "no promotion" is a 0% promotion created on demand. */
export const SEM_PROMO = "Sem promoção";
export async function semPromocaoId(): Promise<number> {
  const found = (await api.list<Promocao>("promocao")).find((p) => p.nome === SEM_PROMO);
  return found?.id ?? (await api.create("promocao", { nome: SEM_PROMO, valor_percentual: 0, dt_inicio: "2000-01-01", dt_final: "2099-12-31" })).id;
}
