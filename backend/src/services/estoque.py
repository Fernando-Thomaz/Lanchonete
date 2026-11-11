from ..models.estoque import EstoqueModel
from .erros import ErroEstoqueExiste, ErroEstoqueNaoEncontrado, ErroInesperado

#region FUNCAO CREATE
def create_estoque(session, dados):
    # verifica se existe
    existe = session.query(EstoqueModel).filter(EstoqueModel.nome == dados.nome,
                                                EstoqueModel.qtd == dados.qtd,
                                                EstoqueModel.unidade_medida == dados.unidade_medida,
                                                EstoqueModel.fornecedor_id == dados.fornecedor_id).first()
    if existe:
        session.rollback()
        return ErroEstoqueExiste()

    # tratamento de erros
    try:
        # cria objeto
        estoque = EstoqueModel(dados.nome,
                               dados.qtd,
                               dados.unidade_medida,
                               dados.fornecedor_id)

        # salva no banco
        session.add(estoque)
        session.commit()

        return {"mensagem": "Estoque criado com sucesso!!", "id": estoque.id}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO READ
def read_estoque(session):
    return session.query(EstoqueModel).all()
#endregion

#region FUNCAO UPDATE
def update_estoque(session, dados, id):
    # verifica se existe
    existe_old = session.query(EstoqueModel).filter(EstoqueModel.id == id).first()
    existe_new = session.query(EstoqueModel).filter(EstoqueModel.nome == dados.nome,
                                                    EstoqueModel.qtd == dados.qtd,
                                                    EstoqueModel.unidade_medida == dados.unidade_medida,
                                                    EstoqueModel.fornecedor_id == dados.fornecedor_id).first()
    if not existe_old:
        session.rollback()
        return ErroEstoqueNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroEstoqueExiste()

    # tratamento de erros
    try:
        # atualiza o objeto
        existe_old.nome = dados.nome
        existe_old.qtd = dados.qtd
        existe_old.unidade_medida = dados.unidade_medida
        existe_old.fornecedor_id = dados.fornecedor_id

        # atualiza as mudancas no banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem": "Estoque foi atualizado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_estoque(session, id):
    # verifica se existe
    existe = session.query(EstoqueModel).filter(EstoqueModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroEstoqueNaoEncontrado()

    # tratamento de erros
    try:
        # deleta o objeto do banco
        session.delete(existe)
        session.commit()

        return {"mensagem": "Estoque foi deletado com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
