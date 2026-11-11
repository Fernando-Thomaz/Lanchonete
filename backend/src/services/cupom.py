from ..models.cupom import CupomModel
from .erros import ErroCupomExiste, ErroCupomNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_cupom(session, dados):
    # verifica se existe
    existe = session.query(CupomModel).filter(CupomModel.nome == dados.nome,
                                              CupomModel.valor_percentual == dados.valor_percentual,
                                              CupomModel.validade == dados.validade).first()
    if existe:
        session.rollback()
        return ErroCupomExiste()

    # tratamento de erros
    try:
        # cria objeto
        cupom = CupomModel(dados.nome,
                           dados.valor_percentual,
                           dados.validade)

        # salva no banco
        session.add(cupom)
        session.commit()

        return {"mensagem":"Cupom criado com sucesso!!", "id": cupom.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
    
#region FUNCAO READ
def read_cupom(session):
    return session.query(CupomModel).all()
#endregion

#region FUNCAO UPDATE
def update_cupom(session, dados, id):
    # verifica se existe
    existe_old = session.query(CupomModel).filter(CupomModel.id == id).first()
    existe_new = session.query(CupomModel).filter(CupomModel.nome == dados.nome,
                                                  CupomModel.valor_percentual == dados.valor_percentual,
                                                  CupomModel.validade == dados.validade).first()
    if not existe_old:
        session.rollback()
        return ErroCupomNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroCupomExiste()

    # tratamento de erro
    try:
        # atualiza o objeto
        existe_old.nome = dados.nome
        existe_old.valor_percentual = dados.valor_percentual
        existe_old.validade = dados.validade

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Cupom foi atualizado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_cupom(session, id):
    # verifica se existe
    existe = session.query(CupomModel).filter(CupomModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroCupomNaoEncontrado()

    # tratamento de erro
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Cupom foi deletado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion