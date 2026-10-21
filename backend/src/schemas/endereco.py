from pydantic import BaseModel
from typing import Optional

# schema padrao
class EnderecoSchema(BaseModel):
    rua: str
    numero: int
    cep: str
    bairro: Optional[str] = None

# schema para a coleta de informacoes
class EnderecoSchemaRead(BaseModel):
    id: int
    rua: str
    numero: int
    cep: str
    bairro: Optional[str] = None

# schema para atualizar
class EnderecoSchemaUpdate(BaseModel):
    rua: Optional[str] = None
    numero: Optional[int] = None
    cep: Optional[str] = None
    bairro: Optional[str] = None