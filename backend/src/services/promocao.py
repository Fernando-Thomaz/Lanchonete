from ..models.promocao import PromocaoModel
from .erros import ErroPromocaoExiste, ErroPromocaoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_promocao(session, dados):
    # verifica se existe
    existe = session.query(PromocaoModel).filter(PromocaoModel.nome == dados.nome,
                                                 PromocaoModel.dt_inicio == dados.dt_inicio,
                                                 PromocaoModel.dt_final == dados.dt_final,
                                                 PromocaoModel.valor_percentual == dados.valor_percentual).first()
    if existe:
        session.rollback()
        return ErroPromocaoExiste()

    # tratamento de erros
    try:
        # criando objeto
        promocao = PromocaoModel(dados.nome,
                                 dados.dt_inicio,
                                 dados.dt_final,
                                 dados.valor_percentual)

        # salva objeto
        session.add(promocao)
        session.commit()

        return {"mensagem": "Promocao criada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_promocao(session):
    return session.query(PromocaoModel).all()
#endregion

#region FUNCAO UPDATE
def update_promocao(session, dados, id):
    # verifica se existe
    existe_old = session.query(PromocaoModel).filter(PromocaoModel.id == id).first()
    existe_new = session.query(PromocaoModel).filter(PromocaoModel.nome == dados.nome,
                                                     PromocaoModel.dt_inicio == dados.dt_inicio,
                                                     PromocaoModel.dt_final == dados.dt_final,
                                                     PromocaoModel.valor_percentual == dados.valor_percentual).first()
    if not existe_old:
        session.rollback()
        return ErroPromocaoNaoEncontrado()
    if existe_new and existe_new.id != id:
        session.rollback()
        return ErroPromocaoExiste()

    # tratamento de erros
    try:
        existe_old.nome = dados.nome
        existe_old.dt_inicio = dados.dt_inicio
        existe_old.dt_final = dados.dt_final
        existe_old.valor_percentual = dados.valor_percentual

        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Promocao foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_promocao(session, id):
    # verifica se existe
    existe = session.query(PromocaoModel).filter(PromocaoModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroPromocaoNaoEncontrado()

    # tratamento de erros
    try:
        # deleta objeto e salva alteracoes
        session.delete(existe)
        session.commit()

        return {"mensagem": "Promocao foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
