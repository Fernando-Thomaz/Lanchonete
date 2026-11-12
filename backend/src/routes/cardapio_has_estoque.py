from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.cardapio_has_estoque import Cardapio_has_estoqueSchema, Cardapio_has_estoqueSchemaRead, Cardapio_has_estoqueSchemaUpdate
from ..services.cardapio_has_estoque import create_cardapio_has_estoque, delete_cardapio_has_estoque, read_cardapio_has_estoque, update_cardapio_has_estoque

cardapio_has_estoque_router = APIRouter(prefix="/cardapio_has_estoque", tags=["cardapio_has_estoque"])

@cardapio_has_estoque_router.post("/create", summary="Cria um cardapio_has_estoque")
def criar_cardapio_has_estoque(dados: Cardapio_has_estoqueSchema, session: Session = Depends(get_session)):
    return create_cardapio_has_estoque(session, dados)

@cardapio_has_estoque_router.get("/list", summary="Lista todos os cardapio_has_estoque")
def listar_cardapio_has_estoque(session: Session = Depends(get_session)):
    return read_cardapio_has_estoque(session)

@cardapio_has_estoque_router.put("/update/{id}", summary="Atualiza um cardapio_has_estoque")
def atualizar_cardapio_has_estoque(id: int, dados: Cardapio_has_estoqueSchemaUpdate, session: Session = Depends(get_session)):
    return update_cardapio_has_estoque(session, dados, id)

@cardapio_has_estoque_router.delete("/delete/{id}",summary="Deleta um cardapio_has_estoque")
def remover_cardapio_has_estoque(id: int, session: Session = Depends(get_session)):
    return delete_cardapio_has_estoque(session, id)
