from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.trabalhador import TrabalhadorSchema, TrabalhadorSchemaRead, TrabalhadorSchemaUpdate
from ..services.trabalhador import create_trabalhador, delete_trabalhador, read_trabalhador, update_trabalhador

trabalhador_router = APIRouter(prefix="/trabalhador", tags=["trabalhador"])

@trabalhador_router.post("/create", summary="Cria um trabalhador")
def criar_trabalhador(dados: TrabalhadorSchema, session: Session = Depends(get_session)):
    return create_trabalhador(session, dados)

@trabalhador_router.get("/list", summary="Lista todos os trabalhadores")
def listar_trabalhadores(session: Session = Depends(get_session)):
    return read_trabalhador(session)

@trabalhador_router.put("/update/{id}", summary="Atualiza um trabalhador")
def atualizar_trabalhador(id: int, dados: TrabalhadorSchemaUpdate, session: Session = Depends(get_session)):
    return update_trabalhador(session, dados, id)

@trabalhador_router.delete("/delete/{id}",summary="Deleta um trabalhador")
def remover_trabalhador(id: int, session: Session = Depends(get_session)):
    return delete_trabalhador(session, id)
