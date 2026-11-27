from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.categoria import CategoriaSchema, CategoriaSchemaRead, CategoriaSchemaUpdate
from ..services.categoria import create_categoria, delete_categoria, read_categoria, update_categoria

categoria_router = APIRouter(prefix="/categoria", tags=["categoria"])

@categoria_router.post("/create", summary="Cria uma categoria")
def criar_categoria(dados: CategoriaSchema, session: Session = Depends(get_session)):
    return create_categoria(session, dados)

@categoria_router.get("/list", summary="Lista todas as categorias")
def listar_categorias(session: Session = Depends(get_session)):
    return read_categoria(session)

@categoria_router.put("/update/{id}", summary="Atualiza uma categoria")
def atualizar_categoria(id: int, dados: CategoriaSchemaUpdate, session: Session = Depends(get_session)):
    return update_categoria(session, dados, id)

@categoria_router.delete("/delete/{id}",summary="Deleta uma categoria")
def remover_categoria(id: int, session: Session = Depends(get_session)):
    return delete_categoria(session, id)
