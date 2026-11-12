from ..models.cardapio_has_estoque import Categoria_has_estoqueModel
from .erros import ErroCardapio_has_estoqueExiste, ErroCardapio_has_estoqueNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_cardapio_has_estoque(session, dados):
    # verifica se existe
    existe = session.query(Categoria_has_estoqueModel).filter(Categoria_has_estoqueModel.cardapio_id == dados.cardapio_id, 
                                                              Categoria_has_estoqueModel.estoque_id == dados.estoque_id).first()
    if existe:
        session.rollback()
        raise ErroCardapio_has_estoqueExiste()

    # tratamento de erros
    try:
        # cria objeto
        cardapio_has_estoque = Categoria_has_estoqueModel(dados.qtd, 
                                                          dados.cardapio_id, 
                                                          dados.estoque_id)

        # salva no banco
        session.add(cardapio_has_estoque)
        session.commit()

        return {"mensagem": "Cardapio_has_estoque criada com sucesso!!", "id": cardapio_has_estoque.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_cardapio_has_estoque(session):
    return session.query(Categoria_has_estoqueModel).all()
#endregion

#region FUNCAO UPDATE
def update_cardapio_has_estoque(session, dados, id):
    # verifica se existe
    existe_old = session.query(Categoria_has_estoqueModel).filter(Categoria_has_estoqueModel.id == id).first()
    existe_new = session.query(Categoria_has_estoqueModel).filter(Categoria_has_estoqueModel.qtd == dados.qtd,
                                                                  Categoria_has_estoqueModel.cardapio_id == dados.cardapio_id,
                                                                  Categoria_has_estoqueModel.estoque_id == dados.estoque_id).first()
    if not existe_old:
        session.rollback()
        raise ErroCardapio_has_estoqueNaoEncontrado()
    if existe_new:
        session.rollback()
        raise ErroCardapio_has_estoqueExiste()

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.qtd = dados.qtd
        existe_old.cardapio_id = dados.cardapio_id
        existe_old.estoque_id = dados.estoque_id

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Cardapio_has_estoque foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_cardapio_has_estoque(session, id):
    # verifica se existe
    existe = session.query(Categoria_has_estoqueModel).filter(Categoria_has_estoqueModel.id == id).first()
    if not existe:
        session.rollback()
        raise ErroCardapio_has_estoqueNaoEncontrado()

    # tratamento de erros
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem": "Cardapio_has_estoque foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
