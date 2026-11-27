from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.trabalhador_has_pedido import Trabalhador_has_pedidoSchema, Trabalhador_has_pedidoSchemaUpdate
from ..services.trabalhador_has_pedido import create_trabalhador_has_pedido, delete_trabalhador_has_pedido, read_trabalhador_has_pedido, update_trabalhador_has_pedido

trabalhador_has_pedido_router = APIRouter(prefix="/trabalhador_has_pedido", tags=["trabalhador_has_pedido"])

@trabalhador_has_pedido_router.post("/create", summary="Cria um trabalhador_has_pedido")
def criar_trabalhador_has_pedido(dados: Trabalhador_has_pedidoSchema, session: Session = Depends(get_session)):
    return create_trabalhador_has_pedido(session, dados)

@trabalhador_has_pedido_router.get("/list", summary="Lista todos os trabalhador_has_pedido")
def listar_trabalhador_has_pedido(session: Session = Depends(get_session)):
    return read_trabalhador_has_pedido(session)

@trabalhador_has_pedido_router.put("/update/{id}", summary="Atualiza um trabalhador_has_pedido")
def atualizar_trabalhador_has_pedido(id: int, dados: Trabalhador_has_pedidoSchemaUpdate, session: Session = Depends(get_session)):
    return update_trabalhador_has_pedido(session, dados, id)

@trabalhador_has_pedido_router.delete("/delete/{id}",summary="Deleta um trabalhador_has_pedido")
def remover_trabalhador_has_pedido(id: int, session: Session = Depends(get_session)):
    return delete_trabalhador_has_pedido(session, id)
