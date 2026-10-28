from ..models.pagamento import PagamentoModel
from .erros import ErroPagamentoExiste, ErroPagamentoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_pagamento(session, dados):
    # verifica se existe
    existe = session.query(PagamentoModel).filter(PagamentoModel.dinheiro == dados.dinheiro,
                                                  PagamentoModel.pix == dados.pix,
                                                  PagamentoModel.cartao == dados.cartao).first()
    if existe:
        session.rollback()
        return ErroPagamentoExiste()

    # tratamento de erros
    try:
        pagamento = PagamentoModel(dados.dinheiro,
                                   dados.pix,
                                   dados.cartao)

        session.add(pagamento)
        session.commit()

        return {"mensagem": "Pagamento criada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_pagamento(session):
    return session.query(PagamentoModel).all()
#endregion

#region FUNCAO UPDATE
def update_pagamento(session, dados, id):
    # tratamento de erros
    existe_old = session.query(PagamentoModel).filter(PagamentoModel.id == id).first()
    existe_new = session.query(PagamentoModel).filter(PagamentoModel.dinheiro == dados.dinheiro,
                                                      PagamentoModel.pix == dados.pix,
                                                      PagamentoModel.cartao == dados.cartao).first()
    if not existe_old:
        session.rollback()
        return ErroPagamentoNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroPagamentoExiste()

    # tratamento de erros
    try:
        # atualizando objeto
        existe_old.dinheiro = dados.dinheiro
        existe_old.pix = dados.pix
        existe_old.cartao = dados.cartao

        # salva alteracoes no banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Pagamento foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_pagamento(session, id):
    # verifica se existe
    existe = session.query(PagamentoModel).filter(PagamentoModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroPagamentoNaoEncontrado()

    # tratamento de erros
    try:
        # deleta objeto e salva alteracoes no banco
        session.delete(existe)
        session.commit()

        return {"mensagem": "Pagamento foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
