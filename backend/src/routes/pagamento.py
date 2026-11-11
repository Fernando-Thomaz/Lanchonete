from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_session
from ..schemas.pagamento import PagamentoSchema, PagamentoSchemaRead, PagamentoSchemaUpdate
from ..services.pagamento import create_pagamento, delete_pagamento, read_pagamento, update_pagamento

pagamento_router = APIRouter(prefix="/pagamento", tags=["pagamento"])

@pagamento_router.post("/create", summary="Cria um pagamento")
def criar_pagamento(dados: PagamentoSchema, session: Session = Depends(get_session)):
    return create_pagamento(session, dados)

@pagamento_router.get("/list", summary="Lista todos os pagamentos")
def listar_pagamentos(session: Session = Depends(get_session)):
    return read_pagamento(session)

@pagamento_router.put("/update/{id}", summary="Atualiza um pagamento")
def atualizar_pagamento(id: int, dados: PagamentoSchemaUpdate, session: Session = Depends(get_session)):
    return update_pagamento(session, dados, id)

@pagamento_router.delete("/delete/{id}",summary="Deleta um pagamento")
def remover_pagamento(id: int, session: Session = Depends(get_session)):
    return delete_pagamento(session, id)
