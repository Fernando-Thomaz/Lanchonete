from pydantic import BaseModel
from typing import Optional

# schema padrao
class CategoriaSchema(BaseModel):
    nome: str

# schema para a coleta de informacoes
class CategoriaSchemaRead(BaseModel):
    id: int
    nome: str

# schema para atualizar
class CategoriaSchemaUpdate(BaseModel):
    nome: Optional[str] = None