from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.cliente_has_endereco import Cliente_has_enderecoSchema, Cliente_has_enderecoSchemaUpdate
from ..services.cliente_has_endereco import create_cliente_has_endereco, delete_cliente_has_endereco, read_cliente_has_endereco, update_cliente_has_endereco

cliente_has_endereco_router = APIRouter(prefix="/cliente_has_endereco", tags=["cliente_has_endereco"])

@cliente_has_endereco_router.post("/create", summary="Cria um cliente_has_endereco")
def criar_cliente_has_endereco(dados: Cliente_has_enderecoSchema, session: Session = Depends(get_session)):
    return create_cliente_has_endereco(session, dados)

@cliente_has_endereco_router.get("/list", summary="Lista todos os cliente_has_endereco")
def listar_cliente_has_endereco(session: Session = Depends(get_session)):
    return read_cliente_has_endereco(session)

@cliente_has_endereco_router.put("/update/{id}", summary="Atualiza um cliente_has_endereco")
def atualizar_cliente_has_endereco(id: int, dados: Cliente_has_enderecoSchemaUpdate, session: Session = Depends(get_session)):
    return update_cliente_has_endereco(session, dados, id)

@cliente_has_endereco_router.delete("/delete/{id}",summary="Deleta um cliente_has_endereco")
def remover_cliente_has_endereco(id: int, session: Session = Depends(get_session)):
    return delete_cliente_has_endereco(session, id)
