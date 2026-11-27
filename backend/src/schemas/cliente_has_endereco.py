from pydantic import BaseModel
from typing import Optional

# schema padrao e para coleta de informacoes
class Cliente_has_enderecoSchema(BaseModel):
    endereco_id: int
    cliente_id: int

# schema para atualizar
class Cliente_has_enderecoSchemaUpdate(BaseModel):
    endereco_id: Optional[int] = None
    cliente_id: Optional[int] = None