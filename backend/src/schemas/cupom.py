from pydantic import BaseModel
from typing import Optional
from datetime import date

# schema padrao
class CupomSchema(BaseModel):
    nome: str
    valor_percentual: float
    validade: date

# schema para a coleta de informacoes
class CupomSchemaRead(BaseModel):
    id: int
    nome: str
    valor_percentual: float
    validade: date

# schema para atualizar
class CupomSchemaUpdate(BaseModel):
    nome: Optional[str] = None
    valor_percentual: Optional[float] = None
    validade: Optional[date] = None