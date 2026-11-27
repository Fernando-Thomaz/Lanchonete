import { describe, expect, it } from "vitest";
import { extrasTag, extrasValue, parseExtrasValue } from "@/lib/extras";

describe("ingredientes extras", () => {
  it("soma o preço de cada extra ao item", () => {
    expect(extrasValue([{ estoque_id: 1, nome: "Carne", n: 2, preco: 6 }, { estoque_id: 2, nome: "Alface", n: 1, preco: 1.5 }])).toBe(13.5);
  });
  it("recupera o valor dos extras salvo no pedido", () => {
    expect(parseExtrasValue(`2× X-Burger: +1 Carne${extrasTag(12)}; 1× X-Salada: +1 Alface${extrasTag(1.5)}`)).toBe(13.5);
  });
});
