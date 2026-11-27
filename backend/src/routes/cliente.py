from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.cliente import ClienteSchema, ClienteSchemaRead, ClienteSchemaUpdate
from ..services.cliente import create_cliente, delete_cliente, read_cliente, update_cliente

cliente_router = APIRouter(prefix="/cliente", tags=["cliente"])

@cliente_router.post("/create", summary="Cria um cliente")
def criar_cliente(dados: ClienteSchema, session: Session = Depends(get_session)):
    return create_cliente(session, dados)

@cliente_router.get("/list", summary="Lista todos os clientes")
def listar_clientes(session: Session = Depends(get_session)):
    return read_cliente(session)

@cliente_router.put("/update/{id}", summary="Atualiza um cliente")
def atualizar_cliente(id: int, dados: ClienteSchemaUpdate, session: Session = Depends(get_session)):
    return update_cliente(session, dados, id)

@cliente_router.delete("/delete/{id}",summary="Deleta um cliente")
def remover_cliente(id: int, session: Session = Depends(get_session)):
    return delete_cliente(session, id)
