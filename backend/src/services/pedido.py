from ..models.pedido import PedidoModel
from .erros import ErroPedidoExiste, ErroPedidoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_pedido(session, dados):
    # tratamento de erros
    try:
        # criando objeto
        pedido = PedidoModel(dados.tipo_pedido,
                             dados.tipo_entrega,
                             dados.variacao_pedido,
                             dados.adicional_pedido,
                             dados.observacao_pedido,
                             dados.cliente_id,
                             dados.mesa_id,
                             dados.cupom_id,
                             dados.avaliacao_id,
                             dados.pagamento_id)

        # salva no banco
        session.add(pedido)
        session.commit()

        return {"mensagem": "Pedido criada com sucesso!!", "id": pedido.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_pedido(session):
    return session.query(PedidoModel).all()
#endregion

#region FUNCAO UPDATE
def update_pedido(session, dados, id):
    # verifica se existe
    existe_old = session.query(PedidoModel).filter(PedidoModel.id == id).first()
    if not existe_old:
        session.rollback()
        return ErroPedidoNaoEncontrado()

    # tratamento de erros
    try:
        # atualizando objeto
        existe_old.tipo_pedido = dados.tipo_pedido
        existe_old.tipo_entrega = dados.tipo_entrega
        existe_old.variacao_pedido = dados.variacao_pedido
        existe_old.adicional_pedido = dados.adicional_pedido
        existe_old.observacao_pedido = dados.observacao_pedido
        existe_old.cliente_id = dados.cliente_id
        existe_old.mesa_id = dados.mesa_id
        existe_old.cupom_id = dados.cupom_id
        existe_old.avaliacao_id = dados.avaliacao_id
        existe_old.pagamento_id = dados.pagamento_id

        # salva alteracoes no banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Pedido foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_pedido(session, id):
    # verifica se existe
    existe = session.query(PedidoModel).filter(PedidoModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroPedidoNaoEncontrado()

    # tratamento de erros
    try:
        # deleta objeto e salva alteracoes
        session.delete(existe)
        session.commit()

        return {"mensagem": "Pedido foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
