from ..models.trabalhador import TrabalhadorModel
from .erros import ErroTrabalhadorExiste, ErroTrabalhadorNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_trabalhador(session, dados):
    # verifica se existe
    existe = session.query(TrabalhadorModel).filter(TrabalhadorModel.nome == dados.nome,
                                                    TrabalhadorModel.contato == dados.contato).first()
    if existe:
        session.rollback()
        return ErroTrabalhadorExiste()

    # tratamento de erros
    try:
        trabalhador = TrabalhadorModel(dados.nome, dados.contato)
        session.add(trabalhador)
        session.commit()

        return {"mensagem": "Trabalhador criada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_trabalhador(session):
    return session.query(TrabalhadorModel).all()
#endregion

#region FUNCAO UPDATE
def update_trabalhador(session, dados, id):
    # verifica se existe
    existe_old = session.query(TrabalhadorModel).filter(TrabalhadorModel.id == id).first()
    existe_new = session.query(TrabalhadorModel).filter(TrabalhadorModel.nome == dados.nome,
                                                        TrabalhadorModel.contato == dados.contato).first()
    if not existe_old:
        session.rollback()
        return ErroTrabalhadorNaoEncontrado()
    if existe_new and existe_new.id != id:
        session.rollback()
        return ErroTrabalhadorExiste()

    # tratamento de erros
    try:
        existe_old.nome = dados.nome
        existe_old.contato = dados.contato

        # salva alteracoes
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Trabalhador foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_trabalhador(session, id):
    # verifica se existe
    existe = session.query(TrabalhadorModel).filter(TrabalhadorModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroTrabalhadorNaoEncontrado()

    # tratamento de erros
    try:
        # deleta objeto e salva alteracoes
        session.delete(existe)
        session.commit()

        return {"mensagem": "Trabalhador foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
