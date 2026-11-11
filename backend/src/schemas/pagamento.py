from pydantic import BaseModel
from typing import Optional

# schema padrao e para atualizar
class PagamentoSchema(BaseModel):
    dinheiro: Optional[float] = None
    pix: Optional[float] = None
    cartao: Optional[float] = None

# schema para a coleta de informacoes
class PagamentoSchemaRead(BaseModel):
    id: int
    dinheiro: float
    pix: float
    cartao: float

# schema para atualizar
class PagamentoSchemaUpdate(BaseModel):
    dinheiro: Optional[float] = None
    pix: Optional[float] = None
    cartao: Optional[float] = None