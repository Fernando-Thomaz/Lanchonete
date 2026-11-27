from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.fornecedor import FornecedorSchema, FornecedorSchemaRead, FornecedorSchemaUpdate
from ..services.fornecedor import create_fornecedor, delete_fornecedor, read_fornecedor, update_fornecedor

fornecedor_router = APIRouter(prefix="/fornecedor", tags=["fornecedor"])

@fornecedor_router.post("/create", summary="Cria um fornecedor")
def criar_fornecedor(dados: FornecedorSchema, session: Session = Depends(get_session)):
    return create_fornecedor(session, dados)

@fornecedor_router.get("/list", summary="Lista todos os fornecedores")
def listar_fornecedores(session: Session = Depends(get_session)):
    return read_fornecedor(session)

@fornecedor_router.put("/update/{id}", summary="Atualiza um fornecedor")
def atualizar_fornecedor(id: int, dados: FornecedorSchemaUpdate, session: Session = Depends(get_session)):
    return update_fornecedor(session, dados, id)

@fornecedor_router.delete("/delete/{id}",summary="Deleta um fornecedor")
def remover_fornecedor(id: int, session: Session = Depends(get_session)):
    return delete_fornecedor(session, id)
