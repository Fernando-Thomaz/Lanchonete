from pydantic import BaseModel
from typing import Optional

# schema padrao
class ClienteSchema(BaseModel):
    nome: str
    contato: str

# schema para a coleta de informacoes
class ClienteSchemaRead(BaseModel):
    id: int
    nome: str
    contato: str

# schema para atualizar
class ClienteSchemaUpdate(BaseModel):
    nome: Optional[str] = None
    contato: Optional[str] = None