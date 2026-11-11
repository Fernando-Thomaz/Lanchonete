from ..models.status_pedido import Status_pedidoModel
from .erros import ErroStatus_pedidoExiste, ErroStatus_pedidoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_status_pedido(session, dados):
    # verifica se existe
    existe = session.query(Status_pedidoModel).filter(Status_pedidoModel.status_pedido == dados.status_pedido,
                                                      Status_pedidoModel.dt == dados.dt,
                                                      Status_pedidoModel.pedido_id == dados.pedido_id).first()
    if existe:
        session.rollback()
        return ErroStatus_pedidoExiste()

    # tratamento de erros
    try:
        # criando objeto
        status_pedido = Status_pedidoModel(dados.status_pedido,
                                           dados.dt,
                                           dados.pedido_id)

        # salvando objeto
        session.add(status_pedido)
        session.commit()

        return {"mensagem": "Status_pedido criada com sucesso!!", "id": status_pedido.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_status_pedido(session):
    return session.query(Status_pedidoModel).all()
#endregion

#region FUNCAO UPDATE
def update_status_pedido(session, dados, id):
    # verifica se existe
    existe_old = session.query(Status_pedidoModel).filter(Status_pedidoModel.id == id).first()
    existe_new = session.query(Status_pedidoModel).filter(Status_pedidoModel.status_pedido == dados.status_pedido,
                                                          Status_pedidoModel.dt == dados.dt,
                                                          Status_pedidoModel.pedido_id == dados.pedido_id).first()
    if not existe_old:
        session.rollback()
        return ErroStatus_pedidoNaoEncontrado()
    if existe_new and existe_new.id != id:
        session.rollback()
        return ErroStatus_pedidoExiste()

    # tratamento de erros
    try:
        # atualizando objeto
        existe_old.status_pedido = dados.status_pedido
        existe_old.dt = dados.dt
        existe_old.pedido_id = dados.pedido_id

        # salva alteracoes
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Status_pedido foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_status_pedido(session, id):
    # verifica se existe
    existe = session.query(Status_pedidoModel).filter(Status_pedidoModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroStatus_pedidoNaoEncontrado()

    # tratamento de erros
    try:
        session.delete(existe)
        session.commit()

        return {"mensagem": "Status_pedido foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
