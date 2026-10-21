from pydantic import BaseModel
from typing import Optional

# schema padrao
class PedidoSchema(BaseModel):
    tipo_pedido: str
    tipo_entrega: str
    varicao_pedido: Optional[str] = None
    adicional_pedido: Optional[str] = None
    observacao_pedido: Optional[str] = None
    cliente_id: Optional[int] = None
    mesa_id: Optional[int] = None
    cupom_id: Optional[int] = None
    avaliacao_id: Optional[int] = None
    pagamento_id: int

# schema para a coleta de informacoes
class PedidoSchemaRead(BaseModel):
    tipo_pedido: str
    tipo_entrega: str
    varicao_pedido: Optional[str] = None
    adicional_pedido: Optional[str] = None
    observacao_pedido: Optional[str] = None
    cliente_id: Optional[int] = None
    mesa_id: Optional[int] = None
    cupom_id: Optional[int] = None
    avaliacao_id: Optional[int] = None
    pagamento_id: int

# schema para atualizar
class PedidoSchemaUpdate(BaseModel):
    tipo_pedido: Optional[str] = None
    tipo_entrega: Optional[str] = None
    varicao_pedido: Optional[str] = None
    adicional_pedido: Optional[str] = None
    observacao_pedido: Optional[str] = None
    cliente_id: Optional[int] = None
    mesa_id: Optional[int] = None
    cupom_id: Optional[int] = None
    avaliacao_id: Optional[int] = None
    pagamento_id: Optional[int] = None