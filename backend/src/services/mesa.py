from ..models.mesa import MesaModel
from .erros import ErroMesaExiste, ErroMesaNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_mesa(session, dados):
    # verifica se existe
    existe = session.query(MesaModel).filter(MesaModel.qtd_cadeira == dados.qtd_cadeira,
                                             MesaModel.numero == dados.numero,
                                             MesaModel.ocupada == dados.ocupada).first()
    if existe:
        session.rollback()
        return ErroMesaExiste()

    # tratamento de erros
    try:
        # criando objeto
        mesa = MesaModel(dados.qtd_cadeira,
                         dados.numero,
                         dados.ocupada)

        # adiciona no banco e salva
        session.add(mesa)
        session.commit()

        return {"mensagem": "Mesa criada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_mesa(session):
    return session.query(MesaModel).all()
#endregion

#region FUNCAO UPDATE
def update_mesa(session, dados, id):
    # verifica se existe
    existe_old = session.query(MesaModel).filter(MesaModel.id == id).first()
    existe_new = session.query(MesaModel).filter(MesaModel.qtd_cadeira == dados.qtd_cadeira,
                                                 MesaModel.numero == dados.numero,
                                                 MesaModel.ocupada == dados.ocupada).first()
    if not existe_old:
        session.rollback()
        return ErroMesaNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroMesaExiste()

    # tratamento de erros
    try:
        # atualiza objeto
        existe_old.qtd_cadeira = dados.qtd_cadeira
        existe_old.numero = dados.numero
        existe_old.ocupada = dados.ocupada

        # atualiza o banco com as alteracoes
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Mesa foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_mesa(session, id):
    # verifica se existe
    existe = session.query(MesaModel).filter(MesaModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroMesaNaoEncontrado()

    # tratamento de erros
    try:
        # deleta o objeto e salva alteracoes
        session.delete(existe)
        session.commit()

        return {"mensagem": "Mesa foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
