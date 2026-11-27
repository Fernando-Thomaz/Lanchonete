from pydantic import BaseModel
from typing import Optional

# schema padrao
class EstoqueSchema(BaseModel):
    nome: str
    qtd: int
    unidade_medida: str
    fornecedor_id: int

# schema para a coleta de informacoes
class EstoqueSchemaRead(BaseModel):
    id: int
    nome: str
    qtd: int
    unidade_medida: str
    fornecedor_id: int

# schema para atualizar
class EstoqueSchemaUpdate(BaseModel):
    nome: Optional[str] = None
    qtd: Optional[int] = None
    unidade_medida: Optional[str] = None
    fornecedor_id: Optional[int] = None

