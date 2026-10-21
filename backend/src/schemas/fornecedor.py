from pydantic import BaseModel
from typing import Optional

# schema padrao
class FornecedorSchema(BaseModel):
    nome: str
    contato: str

# schema para a coleta de informacoes
class FornecedorSchemaRead(BaseModel):
    id: int
    nome: str
    contato: str

# schema para atualizar
class FornecedorSchemaUpdate(BaseModel):
    nome: Optional[str] = None
    contato: Optional[str] = None