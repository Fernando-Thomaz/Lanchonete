from pydantic import BaseModel
from typing import Optional

# schema padrao
class AvaliacaoSchema(BaseModel):
    nota: float
    comentario: Optional[str] = None

# schema para a coleta de informacoes
class AvaliacaoSchemaRead(BaseModel):
    id: int
    nota: float
    comentario: Optional[str] = None

# schema para atualizar
class AvaliacaoSchemaUpdate(BaseModel):
    nota: Optional[float] = None
    comentario: Optional[str] = None