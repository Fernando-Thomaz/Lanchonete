from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.status_cargo import Status_cargoSchema, Status_cargoSchemaRead, Status_cargoSchemaUpdate
from ..services.status_cargo import create_status_cargo, delete_status_cargo, read_status_cargo, update_status_cargo

status_cargo_router = APIRouter(prefix="/status_cargo", tags=["status_cargo"])

@status_cargo_router.post("/create", summary="Cria um status_cargo")
def criar_status_cargo(dados: Status_cargoSchema, session: Session = Depends(get_session)):
    return create_status_cargo(session, dados)

@status_cargo_router.get("/list", summary="Lista todos os status_cargos")
def listar_status_cargos(session: Session = Depends(get_session)):
    return read_status_cargo(session)

@status_cargo_router.put("/update/{id}", summary="Atualiza um status_cargo")
def atualizar_status_cargo(id: int, dados: Status_cargoSchemaUpdate, session: Session = Depends(get_session)):
    return update_status_cargo(session, dados, id)

@status_cargo_router.delete("/delete/{id}",summary="Deleta um status_cargo")
def remover_status_cargo(id: int, session: Session = Depends(get_session)):
    return delete_status_cargo(session, id)
