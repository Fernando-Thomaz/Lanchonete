from ..models.status_cargo import Status_cargoModel
from .erros import ErroStatus_cargoExiste, ErroStatus_cargoNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_status_cargo(session, dados):
    # verifica se existe
    existe = session.query(Status_cargoModel).filter(Status_cargoModel.dt_inicio == dados.dt_inicio,
                                                     Status_cargoModel.dt_final == dados.dt_final,
                                                     Status_cargoModel.cargo == dados.cargo,
                                                     Status_cargoModel.trabalhador_id == dados.trabalhador_id).first()
    if existe:
        session.rollback()
        return ErroStatus_cargoExiste()

    # tratamento de erros
    try:
        # criando objeto
        status_cargo = Status_cargoModel(dados.dt_inicio,
                                         dados.dt_final,
                                         dados.cargo,
                                         dados.trabalhador_id)

        # adiciona no banco
        session.add(status_cargo)
        session.commit()

        return {"mensagem": "Status_cargo criada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_status_cargo(session):
    return session.query(Status_cargoModel).all()
#endregion

#region FUNCAO UPDATE
def update_status_cargo(session, dados, id):
    # verifica se existe
    existe_old = session.query(Status_cargoModel).filter(Status_cargoModel.id == id).first()
    existe_new = session.query(Status_cargoModel).filter(Status_cargoModel.dt_inicio == dados.dt_inicio,
                                                         Status_cargoModel.dt_final == dados.dt_final,
                                                         Status_cargoModel.cargo == dados.cargo,
                                                         Status_cargoModel.trabalhador_id == dados.trabalhador_id).first()
    if not existe_old:
        session.rollback()
        return ErroStatus_cargoNaoEncontrado()
    if existe_new and existe_new.id != id:
        session.rollback()
        return ErroStatus_cargoExiste()

    # tratamento de erros
    try:
        # criando objeto
        existe_old.dt_inicio = dados.dt_inicio
        existe_old.dt_final = dados.dt_final
        existe_old.cargo = dados.cargo
        existe_old.trabalhador_id = dados.trabalhador_id

        # salva objeto no banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Status_cargo foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_status_cargo(session, id):
    # verifica se existe
    existe = session.query(Status_cargoModel).filter(Status_cargoModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroStatus_cargoNaoEncontrado()

    # tratamento de erros
    try:
        # deleta objeto e salva alteracoes
        session.delete(existe)
        session.commit()

        return {"mensagem": "Status_cargo foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
