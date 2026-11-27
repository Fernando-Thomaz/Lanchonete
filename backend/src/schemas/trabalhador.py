from pydantic import BaseModel
from typing import Optional

# schema padrao
class TrabalhadorSchema(BaseModel):
    nome: str
    contato: str

# schema para a coleta de informacoes
class TrabalhadorSchemaRead(BaseModel):
    id: int
    nome: str
    contato: str

# schema para atualizar
class TrabalhadorSchemaUpdate(BaseModel):
    nome: Optional[str] = None
    contato: Optional[str] = None