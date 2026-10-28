from ..models.avaliacao import AvaliacaoModel
from .erros import ErroAvaliacaoExiste, ErroAvaliacaoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_avaliacao(session, dados):
    # tratamento de erros
    try:
        # cria objeto
        avaliacao = AvaliacaoModel(dados.nota,
                                   dados.comentario)

        # salva no banco
        session.add(avaliacao)
        session.commit(avaliacao)

        return {"mensagem":"Avaliacao criada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
    
#region FUNCAO READ
def read_avaliacao(session):
    return session.query(AvaliacaoModel).all()

def read_avaliacao_nota(session, nota):
    return session.query(AvaliacaoModel).filter(AvaliacaoModel.nota == nota).all()
#endregion

#region FUNCAO UPDATE
def update_avaliacao(session, dados, id):
    # verifica se existe
    existe_old = session.query(AvaliacaoModel).filter(AvaliacaoModel.id == id).first()
    if not existe_old:
        session.rollback()
        return ErroAvaliacaoNaoEncontrado()

    # tratamento de erro
    try:
        # atualiza o objeto
        existe_old.nota = dados.nota
        existe_old.comentario = dados.comentario

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Avaliacao foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_avaliacao(session, id):
    # verifica se existe
    existe = session.query(AvaliacaoModel).filter(AvaliacaoModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroAvaliacaoNaoEncontrado()

    # tratamento de erro
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Avaliacao foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion