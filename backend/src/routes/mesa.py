from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.mesa import MesaSchema, MesaSchemaRead, MesaSchemaUpdate
from ..services.mesa import create_mesa, delete_mesa, read_mesa, update_mesa

mesa_router = APIRouter(prefix="/mesa", tags=["mesa"])

@mesa_router.post("/create", summary="Cria uma mesa")
def criar_mesa(dados: MesaSchema, session: Session = Depends(get_session)):
    return create_mesa(session, dados)

@mesa_router.get("/list", summary="Lista todas as mesas")
def listar_mesas(session: Session = Depends(get_session)):
    return read_mesa(session)

@mesa_router.put("/update/{id}", summary="Atualiza uma mesa")
def atualizar_mesa(id: int, dados: MesaSchemaUpdate, session: Session = Depends(get_session)):
    return update_mesa(session, dados, id)

@mesa_router.delete("/delete/{id}",summary="Deleta uma mesa")
def remover_mesa(id: int, session: Session = Depends(get_session)):
    return delete_mesa(session, id)
