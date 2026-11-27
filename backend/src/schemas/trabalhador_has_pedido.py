from pydantic import BaseModel
from typing import Optional

# schema padrao e para coleta de informacoes
class Trabalhador_has_pedidoSchema(BaseModel):
    trabalhador_id: int
    pedido_id: int

class Trabalhador_has_pedidoSchemaUpdate(BaseModel):
    trabalhador_id: Optional[int] = None
    pedido_id: Optional[int] = None