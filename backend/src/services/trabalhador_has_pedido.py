from ..models.trabalhador_has_pedido import Trabalhador_has_pedido
from .erros import ErroTrabalhador_has_pedidoExiste, ErroTrabalhador_has_pedidoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_trabalhador_has_pedido(session, dados):
    # verifica se existe
    existe = session.query(Trabalhador_has_pedido).filter(Trabalhador_has_pedido.trabalhador_id == dados.trabalhador_id,
                                                          Trabalhador_has_pedido.pedido_id == dados.pedido_id).first()
    if existe:
        session.rollback()
        raise ErroTrabalhador_has_pedidoExiste()

    # tratamento de erros
    try:
        # cria objeto
        trabalhador_has_pedido = Trabalhador_has_pedido(dados.trabalhador_id, 
                                                        dados.pedido_id)

        # salva no banco
        session.add(trabalhador_has_pedido)
        session.commit()

        return {"mensagem": "Trabalhador_has_pedido criado com sucesso!!", "id": trabalhador_has_pedido.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_trabalhador_has_pedido(session):
    return session.query(Trabalhador_has_pedido).all()
#endregion

#region FUNCAO UPDATE
def update_trabalhador_has_pedido(session, dados, id):
    # verifica se existe
    existe_old = session.query(Trabalhador_has_pedido).filter(Trabalhador_has_pedido.id == id).first()
    existe_new = session.query(Trabalhador_has_pedido).filter(Trabalhador_has_pedido.trabalhador_id == dados.trabalhador_id,
                                                              Trabalhador_has_pedido.pedido_id == dados.pedido_id).first()
    if not existe_old:
        session.rollback()
        raise ErroTrabalhador_has_pedidoNaoEncontrado()
    if existe_new:
        session.rollback()
        raise ErroTrabalhador_has_pedidoExiste()

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.trabalhador_id = dados.trabalhador_id
        existe_old.pedido_id = dados.pedido_id

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Trabalhador_has_pedido foi atualizado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_trabalhador_has_pedido(session, id):
    # verifica se existe
    existe = session.query(Trabalhador_has_pedido).filter(Trabalhador_has_pedido.id == id).first()
    if not existe:
        session.rollback()
        raise ErroTrabalhador_has_pedidoNaoEncontrado()

    # tratamento de erros
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem": "Trabalhador_has_pedido foi deletado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
