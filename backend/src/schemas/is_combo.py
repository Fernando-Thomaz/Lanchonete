from pydantic import BaseModel
from typing import Optional

# schema padrao
class Is_comboSchema(BaseModel):
    cardapio_id: int
    pedido_id: int

# schema para a coleta de informacoes
class Is_comboSchemaRead(BaseModel):
    id: int
    cardapio_id: int
    pedido_id: int

# schema para atualizar
class Is_comboSchemaUpdate(BaseModel):
    cardapio_id: Optional[int] = None
    pedido_id: Optional[int] = None