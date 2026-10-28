from ..models.fornecedor import FornecedorModel
from .erros import ErroFornecedorExiste, ErroFornecedorNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_fornecedor(session, dados):
    # verifica se existe
    existe = session.query(FornecedorModel).filter(FornecedorModel.nome == dados.nome,
                                                   FornecedorModel.contato == dados.contato).first()
    if existe:
        session.rollback()
        return ErroFornecedorExiste()

    # tratamento de erros
    try:
        # cria objeto
        fornecedor = FornecedorModel(dados.nome, 
                                     dados.contato)

        # adiciona no banco
        session.add(fornecedor)
        session.commit()

        return {"mensagem": "Fornecedor criada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_fornecedor(session):
    return session.query(FornecedorModel).all()
#endregion

#region FUNCAO UPDATE
def update_fornecedor(session, dados, id):
    # verifica se existe
    existe_old = session.query(FornecedorModel).filter(FornecedorModel.id == id).first()
    existe_new = session.query(FornecedorModel).filter(FornecedorModel.nome == dados.nome,
                                                       FornecedorModel.contato == dados.contato).first()
    if not existe_old:
        session.rollback()
        return ErroFornecedorNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroFornecedorExiste()

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.nome = dados.nome
        existe_old.contato = dados.contato

        # salva no banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Fornecedor foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_fornecedor(session, id):
    # verifica se existe
    existe = session.query(FornecedorModel).filter(FornecedorModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroFornecedorNaoEncontrado()

    # tratamento de erros
    try:
        # deleta o objeto do banco
        session.delete(existe)
        session.commit()

        return {"mensagem": "Fornecedor foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
