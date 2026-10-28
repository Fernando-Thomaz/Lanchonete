from ..models.categoria import CategoriaModel
from .erros import ErroInesperado, ErroCategoriaExiste, ErroCategoriaNaoEncontrado

#region FUNCAO CREATE
def create_categoria(session, dados):
    # verifica se existe
    existe = session.query(CategoriaModel).filter(CategoriaModel.nome == dados.nome).first()
    if existe:
        session.rollback()
        return ErroCategoriaExiste()

    # tratamento de erros
    try:
        # cria objeto
        categoria = CategoriaModel(dados.nome)

        # salva no banco
        session.add(categoria)
        session.commit(categoria)

        return {"mensagem":"Categoria criada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion
    
#region FUNCAO READ
def read_categoria(session):
    return session.query(CategoriaModel).all()
#endregion

#region FUNCAO UPDATE
def update_categoria(session, dados, id):
    # verifica se existe
    existe_old = session.query(CategoriaModel).filter(CategoriaModel.id == id).first()
    existe_new = session.query(CategoriaModel.nome == dados.nome).first()
    if not existe_old:
        session.rollback()
        return ErroCategoriaNaoEncontrado()
    if existe_new:
        session.rollback()
        return ErroCategoriaExiste()

    # tratamento de erro
    try:
        # atualiza o objeto
        existe_old.nome = dados.nome

        # atualiza o banco
        session.commit()
        session.refresh(existe_old)

        return {"mensagem":"Categoria foi atualizada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion

#region FUNCAO DELETE
def delete_categoria(session, id):
    # verifica se existe
    existe = session.query(CategoriaModel).filter(CategoriaModel.id == id).first()
    if not existe:
        session.rollback()
        return ErroCategoriaNaoEncontrado()

    # tratamento de erro
    try:
        # deleta o objeto e salva no banco
        session.delete(existe)
        session.commit()

        return {"mensagem":"Categoria foi deletada com sucesso!!"}

    except Exception as e:
        session.rollback()
        return ErroInesperado(e)
#endregion