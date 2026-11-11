from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.pedido import PedidoSchema, PedidoSchemaRead, PedidoSchemaUpdate
from ..services.pedido import create_pedido, delete_pedido, read_pedido, update_pedido

pedido_router = APIRouter(prefix="/pedido", tags=["pedido"])

@pedido_router.post("/create", summary="Cria um pedido")
def criar_pedido(dados: PedidoSchema, session: Session = Depends(get_session)):
    return create_pedido(session, dados)

@pedido_router.get("/list", summary="Lista todos os pedidos")
def listar_pedidos(session: Session = Depends(get_session)):
    return read_pedido(session)

@pedido_router.put("/update/{id}", summary="Atualiza um pedido")
def atualizar_pedido(id: int, dados: PedidoSchemaUpdate, session: Session = Depends(get_session)):
    return update_pedido(session, dados, id)

@pedido_router.delete("/delete/{id}",summary="Deleta um pedido")
def remover_pedido(id: int, session: Session = Depends(get_session)):
    return delete_pedido(session, id)
