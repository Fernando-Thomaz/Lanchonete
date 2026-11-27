from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.promocao import PromocaoSchema, PromocaoSchemaRead, PromocaoSchemaUpdate
from ..services.promocao import create_promocao, delete_promocao, read_promocao, update_promocao

promocao_router = APIRouter(prefix="/promocao", tags=["promocao"])

@promocao_router.post("/create", summary="Cria uma promocao")
def criar_promocao(dados: PromocaoSchema, session: Session = Depends(get_session)):
    return create_promocao(session, dados)

@promocao_router.get("/list", summary="Lista todas as promocoes")
def listar_promocoes(session: Session = Depends(get_session)):
    return read_promocao(session)

@promocao_router.put("/update/{id}", summary="Atualiza uma promocao")
def atualizar_promocao(id: int, dados: PromocaoSchemaUpdate, session: Session = Depends(get_session)):
    return update_promocao(session, dados, id)

@promocao_router.delete("/delete/{id}",summary="Deleta uma promocao")
def remover_promocao(id: int, session: Session = Depends(get_session)):
    return delete_promocao(session, id)
