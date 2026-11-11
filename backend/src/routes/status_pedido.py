from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.status_pedido import Status_pedidoSchema, Status_pedidoSchemaRead, Status_pedidoSchemaUpdate
from ..services.status_pedido import create_status_pedido, delete_status_pedido, read_status_pedido, update_status_pedido

status_pedido_router = APIRouter(prefix="/status_pedido", tags=["status_pedido"])

@status_pedido_router.post("/create", summary="Cria um status_pedido")
def criar_status_pedido(dados: Status_pedidoSchema, session: Session = Depends(get_session)):
    return create_status_pedido(session, dados)

@status_pedido_router.get("/list", summary="Lista todos os status_pedidos")
def listar_status_pedidos(session: Session = Depends(get_session)):
    return read_status_pedido(session)

@status_pedido_router.put("/update/{id}", summary="Atualiza um status_pedido")
def atualizar_status_pedido(id: int, dados: Status_pedidoSchemaUpdate, session: Session = Depends(get_session)):
    return update_status_pedido(session, dados, id)

@status_pedido_router.delete("/delete/{id}",summary="Deleta um status_pedido")
def remover_status_pedido(id: int, session: Session = Depends(get_session)):
    return delete_status_pedido(session, id)
