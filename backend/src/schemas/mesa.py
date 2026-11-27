from pydantic import BaseModel
from typing import Optional

# schema padrao
class MesaSchema(BaseModel):
    qtd_cadeira: int
    ocupada: bool
    numero: int

# schema para a coleta de informacoes
class MesaSchemaRead(BaseModel):
    id: int
    qtd_cadeira: int
    ocupada: bool
    numero: int

# schema para atualizar
class MesaSchemaUpdate(BaseModel):
    qtd_cadeira: Optional[int] = None
    ocupada: Optional[bool] = None
    numero: Optional[int] = None