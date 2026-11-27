from ..models.cliente import ClienteModel
from .erros import ErroClienteExiste, ErroClienteNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_cliente(session, dados):
    # verifica se existe
    existe = session.query(ClienteModel).filter(ClienteModel.nome == dados.nome,
                                                ClienteModel.contato == dados.contato).first()
    if existe:
        session.rollback()
        return ErroClienteExiste()

    # tratamento de erros
    try:
        # cria objeto
        cliente = ClienteModel(dados.nome,
                               dados.contato)

        # salva no banco
        session.add(cliente)
        session.commit()

        return {"mensagem":"Cliente criado com sucesso!!", "id": cliente.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
    
#region FUNCAO READ
def read_cliente(session):
    return session.query(ClienteModel).all()
#endregion

#region FUNCAO UPDATE
def update_cliente(session, dados, id):
    # verifica se existe
    existe_old = session.query(ClienteModel).filter(ClienteModel.id == id).first()
    existe_new = session.query(ClienteModel).filter(ClienteModel.nome == dados.nome,
                                                    ClienteModel.contato == dados.contato).first()
    if not existe_old:
        session.rollback()
        return ErroClienteNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroClienteExiste()

    # tratamento de erro
    try:
        # atualiza o objeto
        existe_old.nome = dados.nome
        existe_old.contato = dados.contato

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Cliente foi atualizado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_cliente(session, id):
    # verifica se existe
    existe = session.query(ClienteModel).filter(ClienteModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroClienteNaoEncontrado()

    # tratamento de erro
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Cliente foi deletado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion