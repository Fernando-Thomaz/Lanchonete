from pydantic import BaseModel
from typing import Optional
from datetime import date


# schema padrao
class PromocaoSchema(BaseModel):
    nome: str
    dt_inicio: date
    dt_final: date
    valor_percentual: float

# schema para a coleta de informacoes
class PromocaoSchemaRead(BaseModel):
    id: int
    nome: str
    dt_inicio: date
    dt_final: date
    valor_percentual: float

# schema para atualizar
class PromocaoSchemaUpdate(BaseModel):
    nome: Optional[str] = None
    dt_inicio: Optional[date] = None
    dt_final: Optional[date] = None
    valor_percentual: Optional[float] = None
