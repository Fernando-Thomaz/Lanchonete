from ..models.cardapio import CardapioModel
from .erros import ErroCardapioExiste, ErroCardapioNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_cardapio(session, dados):
    # verifica se existe
    existe = session.query(CardapioModel).filter(CardapioModel.nome == dados.nome,
                                                 CardapioModel.preco_base == dados.preco_base,
                                                 CardapioModel.categoria_id == dados.categoria_id,
                                                 CardapioModel.promocao_id == dados.promocao_id).first()
    if existe:
        session.rollback()
        return ErroCardapioExiste()

    # tratamento de erros
    try:
        # cria objeto
        cardapio = CardapioModel(dados.nome,
                                 dados.preco_base,
                                 dados.categoria_id,
                                 dados.promocao_id)

        # salva no banco
        session.add(cardapio)
        session.commit(cardapio)

        return {"mensagem":"Cardapio criado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
    
#region FUNCAO READ
def read_cardapio(session):
    return session.query(CardapioModel).all()
#endregion

#region FUNCAO UPDATE
def update_cardapio(session, dados, id):
    # verifica se existe
    existe_old = session.query(CardapioModel).filter(CardapioModel.id == id).first()
    existe_new = session.query(CardapioModel).filter(CardapioModel.nome == dados.nome,
                                                     CardapioModel.preco_base == dados.preco_base,
                                                     CardapioModel.categoria_id == dados.categoria_id,
                                                     CardapioModel.promocao_id == dados.promocao_id).first()
    if not existe_old:
        session.rollback()
        return ErroCardapioNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroCardapioExiste()

    # tratamento de erro
    try:
        # atualiza o objeto
        existe_old.nome = dados.nome
        existe_old.preco_base = dados.preco_base
        existe_old.categoria_id = dados.categoria_id
        existe_old.promocao_id = dados.promocao_id

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Cardapio foi atualizado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_cardapio(session, id):
    # verifica se existe
    existe = session.query(CardapioModel).filter(CardapioModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroCardapioNaoEncontrado()

    # tratamento de erro
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Cardapio foi deletado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion