from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# schema padrao
class Status_pedidoSchema(BaseModel):
    status_pedido: str
    dt: datetime
    pedido_id: int

# schema para a coleta de informacoes
class Status_pedidoSchemaRead(BaseModel):
    id: int
    status_pedido: str
    dt: datetime
    pedido_id: int

# schema para atualizar
class Status_pedidoSchemaUpdate(BaseModel):
    status_pedido: Optional[str] = None
    dt: Optional[datetime] = None
    pedido_id: Optional[int] = None