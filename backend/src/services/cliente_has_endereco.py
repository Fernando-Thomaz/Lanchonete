from ..models.cliente_has_endereco import Cliente_has_enderecoModel
from .erros import ErroCliente_has_enderecoExiste, ErroCliente_has_enderecoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_cliente_has_endereco(session, dados):
    # verifica se existe
    existe = session.query(Cliente_has_enderecoModel).filter(Cliente_has_enderecoModel.endereco_id == dados.endereco_id,
                                                             Cliente_has_enderecoModel.cliente_id == dados.cliente_id).first()
    if existe:
        session.rollback()
        raise ErroCliente_has_enderecoExiste()

    # tratamento de erros
    try:
        # cria objeto
        cliente_has_endereco = Cliente_has_enderecoModel(dados.endereco_id, 
                                                         dados.cliente_id)

        # salva no banco
        session.add(cliente_has_endereco)
        session.commit()

        return {"mensagem": "Cliente_has_endereco criada com sucesso!!", "id": cliente_has_endereco.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_cliente_has_endereco(session):
    return session.query(Cliente_has_enderecoModel).all()
#endregion

#region FUNCAO UPDATE
def update_cliente_has_endereco(session, dados, id):
    # verifica se existe
    existe_old = session.query(Cliente_has_enderecoModel).filter(Cliente_has_enderecoModel.id == id).first()
    existe_new = session.query(Cliente_has_enderecoModel).filter(Cliente_has_enderecoModel.endereco_id == dados.endereco_id,
                                                                 Cliente_has_enderecoModel.cliente_id == dados.cliente_id).first()
    if not existe_old:
        session.rollback()
        raise ErroCliente_has_enderecoNaoEncontrado()
    if existe_new:
        session.rollback()
        raise ErroCliente_has_enderecoExiste()

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.endereco_id = dados.endereco_id
        existe_old.cliente_id = dados.cliente_id

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Cliente_has_endereco foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_cliente_has_endereco(session, id):
    # verifica se existe
    existe = session.query(Cliente_has_enderecoModel).filter(Cliente_has_enderecoModel.id == id).first()
    if not existe:
        session.rollback()
        raise ErroCliente_has_enderecoNaoEncontrado()

    # tratamento de erros
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem": "Cliente_has_endereco foi deletado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
