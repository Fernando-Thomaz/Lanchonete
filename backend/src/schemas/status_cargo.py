from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# schema padrao
class Status_cargoSchema(BaseModel):
    dt_inicio: datetime
    dt_final: datetime
    cargo: str
    trabalhador_id: int

# schema para a coleta de informacoes
class Status_cargoSchemaRead(BaseModel):
    id: int
    dt_inicio: datetime
    dt_final: datetime
    cargo: str
    trabalhador_id: int

# schema para atualizar
class Status_cargoSchemaUpdate(BaseModel):
    dt_inicio: Optional[datetime] = None
    dt_final: Optional[datetime] = None
    cargo: Optional[str] = None
    trabalhador_id: Optional[int] = None