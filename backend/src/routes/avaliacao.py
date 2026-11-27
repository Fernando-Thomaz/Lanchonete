from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.avaliacao import AvaliacaoSchema, AvaliacaoSchemaRead, AvaliacaoSchemaUpdate
from ..services.avaliacao import create_avaliacao, delete_avaliacao, read_avaliacao, update_avaliacao

avaliacao_router = APIRouter(prefix="/avaliacao", tags=["avaliacao"])

@avaliacao_router.post("/create", summary="Cria uma avaliação")
def criar_avaliacao(dados: AvaliacaoSchema, session: Session = Depends(get_session)):
    return create_avaliacao(session, dados)

@avaliacao_router.get("/list", summary="Lista todas as avaliações")
def listar_avaliacoes(session: Session = Depends(get_session)):
    return read_avaliacao(session)

@avaliacao_router.put("/update/{id}", summary="Atualiza uma avaliação")
def atualizar_avaliacao(id: int, dados: AvaliacaoSchemaUpdate, session: Session = Depends(get_session)):
    return update_avaliacao(session, dados, id)

@avaliacao_router.delete("/delete/{id}",summary="Deleta uma avaliação")
def remover_avaliacao(id: int, session: Session = Depends(get_session)):
    return delete_avaliacao(session, id)