from ..models.endereco import EnderecoModel
from .erros import ErroEnderecoExiste, ErroEnderecoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_endereco(session, dados):
    # verifica se existe
    existe = session.query(EnderecoModel).filter(EnderecoModel.rua == dados.rua,
                                                 EnderecoModel.numero == dados.numero,
                                                 EnderecoModel.cep == dados.cep,
                                                 EnderecoModel.bairro == dados.bairro).first()
    if existe:
        session.rollback()
        return ErroEnderecoExiste()

    # tratamento de erros
    try:
        # cria objeto
        endereco = EnderecoModel(dados.rua,
                                 dados.numero,
                                 dados.cep,
                                 dados.bairro)

        # salva no banco
        session.add(endereco)
        session.commit(endereco)

        return {"mensagem":"Endereco criado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
    
#region FUNCAO READ
def read_endereco(session):
    return session.query(EnderecoModel).all()
#endregion

#region FUNCAO UPDATE
def update_endereco(session, dados, id):
    # verifica se existe
    existe_old = session.query(EnderecoModel).filter(EnderecoModel.id == id).first()
    existe_new = session.query(EnderecoModel).filter(EnderecoModel.rua == dados.rua,
                                                      EnderecoModel.numero == dados.numero,
                                                      EnderecoModel.cep == dados.cep,
                                                      EnderecoModel.bairro == dados.bairro).first()
    if not existe_old:
        session.rollback()
        return ErroEnderecoNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroEnderecoExiste()

    # tratamento de erro
    try:
        # atualiza o objeto
        existe_old.rua = dados.rua
        existe_old.numero = dados.numero
        existe_old.cep = dados.cep
        existe_old.bairro = dados.bairro

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Endereco foi atualizado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_endereco(session, id):
    # verifica se existe
    existe = session.query(EnderecoModel).filter(EnderecoModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroEnderecoNaoEncontrado()

    # tratamento de erro
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Endereco foi deletado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion