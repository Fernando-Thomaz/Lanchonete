from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.is_combo import Is_comboSchema, Is_comboSchemaRead, Is_comboSchemaUpdate
from ..services.is_combo import create_is_combo, delete_is_combo, read_is_combo, update_is_combo

is_combo_router = APIRouter(prefix="/is_combo", tags=["is_combo"])

@is_combo_router.post("/create", summary="Cria um is_combo")
def criar_is_combo(dados: Is_comboSchema, session: Session = Depends(get_session)):
    return create_is_combo(session, dados)

@is_combo_router.get("/list", summary="Lista todos os is_combo")
def listar_is_combo(session: Session = Depends(get_session)):
    return read_is_combo(session)

@is_combo_router.put("/update/{id}", summary="Atualiza um is_combo")
def atualizar_is_combo(id: int, dados: Is_comboSchemaUpdate, session: Session = Depends(get_session)):
    return update_is_combo(session, dados, id)

@is_combo_router.delete("/delete/{id}",summary="Deleta um is_combo")
def remover_is_combo(id: int, session: Session = Depends(get_session)):
    return delete_is_combo(session, id)
