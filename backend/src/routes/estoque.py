from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.estoque import EstoqueSchema, EstoqueSchemaRead, EstoqueSchemaUpdate
from ..services.estoque import create_estoque, delete_estoque, read_estoque, update_estoque

estoque_router = APIRouter(prefix="/estoque", tags=["estoque"])

@estoque_router.post("/create", summary="Cria um estoque")
def criar_estoque(dados: EstoqueSchema, session: Session = Depends(get_session)):
    return create_estoque(session, dados)

@estoque_router.get("/list", summary="Lista todos os estoques")
def listar_estoques(session: Session = Depends(get_session)):
    return read_estoque(session)

@estoque_router.put("/update/{id}", summary="Atualiza um estoque")
def atualizar_estoque(id: int, dados: EstoqueSchemaUpdate, session: Session = Depends(get_session)):
    return update_estoque(session, dados, id)

@estoque_router.delete("/delete/{id}",summary="Deleta um estoque")
def remover_estoque(id: int, session: Session = Depends(get_session)):
    return delete_estoque(session, id)
