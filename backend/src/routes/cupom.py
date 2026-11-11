from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.cupom import CupomSchema, CupomSchemaRead, CupomSchemaUpdate
from ..services.cupom import create_cupom, delete_cupom, read_cupom, update_cupom

cupom_router = APIRouter(prefix="/cupom", tags=["cupom"])

@cupom_router.post("/create", summary="Cria um cupom")
def criar_cupom(dados: CupomSchema, session: Session = Depends(get_session)):
    return create_cupom(session, dados)

@cupom_router.get("/list", summary="Lista todos os cupons")
def listar_cupons(session: Session = Depends(get_session)):
    return read_cupom(session)

@cupom_router.put("/update/{id}", summary="Atualiza um cupom")
def atualizar_cupom(id: int, dados: CupomSchemaUpdate, session: Session = Depends(get_session)):
    return update_cupom(session, dados, id)

@cupom_router.delete("/delete/{id}",summary="Deleta um cupom")
def remover_cupom(id: int, session: Session = Depends(get_session)):
    return delete_cupom(session, id)
