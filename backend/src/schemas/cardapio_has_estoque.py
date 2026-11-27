from pydantic import BaseModel
from typing import Optional

# schema padrao
class Cardapio_has_estoqueSchema(BaseModel):
    qtd: int
    cardapio_id: int
    estoque_id: int

# schema para a coleta de informacoes
class Cardapio_has_estoqueSchemaRead(BaseModel):
    id: int
    qtd: int
    cardapio_id: int
    estoque_id: int

# schema para atualizar
class Cardapio_has_estoqueSchemaUpdate(BaseModel):
    qtd: Optional[int] = None
    cardapio_id: Optional[int] = None
    estoque_id: Optional[int] = None