from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.endereco import EnderecoSchema, EnderecoSchemaRead, EnderecoSchemaUpdate
from ..services.endereco import create_endereco, delete_endereco, read_endereco, update_endereco

endereco_router = APIRouter(prefix="/endereco", tags=["endereco"])

@endereco_router.post("/create", summary="Cria um endereco")
def criar_endereco(dados: EnderecoSchema, session: Session = Depends(get_session)):
    return create_endereco(session, dados)

@endereco_router.get("/list", summary="Lista todos os enderecos")
def listar_enderecos(session: Session = Depends(get_session)):
    return read_endereco(session)

@endereco_router.put("/update/{id}", summary="Atualiza um endereco")
def atualizar_endereco(id: int, dados: EnderecoSchemaUpdate, session: Session = Depends(get_session)):
    return update_endereco(session, dados, id)

@endereco_router.delete("/delete/{id}",summary="Deleta um endereco")
def remover_endereco(id: int, session: Session = Depends(get_session)):
    return delete_endereco(session, id)
