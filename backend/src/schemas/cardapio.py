from pydantic import BaseModel
from typing import Optional

# schema padrao
class CardapioSchema(BaseModel):
    nome: str
    preco_base: float
    categoria_id: int
    promocao_id: Optional[int] = None

# schema para a coleta de informacoes
class CardapioSchemaRead(BaseModel):
    id: int
    nome: str
    preco_base: float
    categoria_id: int
    promocao_id: Optional[int] = None

# schema para atualizar
class CardapioSchemaUpdate(BaseModel):
    nome: Optional[str] = None
    preco_base: Optional[float] = None
    categoria_id: Optional[int] = None
    promocao_id: Optional[int] = None