from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.cardapio import CardapioSchema, CardapioSchemaRead, CardapioSchemaUpdate
from ..services.cardapio import create_cardapio, delete_cardapio, read_cardapio, update_cardapio

cardapio_router = APIRouter(prefix="/cardapio", tags=["cardapio"])

@cardapio_router.post("/create", summary="Cria um cardapio")
def criar_cardapio(dados: CardapioSchema, session: Session = Depends(get_session)):
    return create_cardapio(session, dados)

@cardapio_router.get("/list", summary="Lista todos os cardapios")
def listar_cardapios(session: Session = Depends(get_session)):
    return read_cardapio(session)

@cardapio_router.put("/update/{id}", summary="Atualiza um cardapio")
def atualizar_cardapio(id: int, dados: CardapioSchemaUpdate, session: Session = Depends(get_session)):
    return update_cardapio(session, dados, id)

@cardapio_router.delete("/delete/{id}",summary="Deleta um cardapio")
def remover_cardapio(id: int, session: Session = Depends(get_session)):
    return delete_cardapio(session, id)
