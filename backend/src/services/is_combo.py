from ..models.is_combo import Is_comboModel
from .erros import ErroIs_comboExiste, ErroIs_comboNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_is_combo(session, dados):
    # verifica se existe
    existe = session.query(Is_comboModel).filter(Is_comboModel.cardapio_id == dados.cardapio_id,
                                                 Is_comboModel.pedido_id == dados.pedido_id).first()
    if existe:
        session.rollback()
        raise ErroIs_comboExiste()

    # tratamento de erros
    try:
        # cria objeto
        is_combo = Is_comboModel(dados.cardapio_id,
                                 dados.pedido_id)

        # salva no banco
        session.add(is_combo)
        session.commit()

        return {"mensagem": "Is_combo criada com sucesso!!", "id": is_combo.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_is_combo(session):
    return session.query(Is_comboModel).all()
#endregion

#region FUNCAO UPDATE
def update_is_combo(session, dados, id):
    # verifica se existe
    existe_old = session.query(Is_comboModel).filter(Is_comboModel.id == id).first()
    existe_new = session.query(Is_comboModel).filter(Is_comboModel.cardapio_id == dados.cardapio_id,
                                                     Is_comboModel.pedido_id == dados.pedido_id).first()
    if not existe_old:
        session.rollback()
        raise ErroIs_comboNaoEncontrado()
    if existe_new:
        session.rollback()
        raise ErroIs_comboExiste()

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.cardapio_id = dados.cardapio_id
        existe_old.pedido_id = dados.pedido_id

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Is_combo foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_is_combo(session, id):
    # verifica se existe
    existe = session.query(Is_comboModel).filter(Is_comboModel.id == id).first()
    if not existe:
        session.rollback()
        raise ErroIs_comboNaoEncontrado()

    # tratamento de erros
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem": "Is_combo foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
