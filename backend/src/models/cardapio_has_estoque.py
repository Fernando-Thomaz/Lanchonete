from ..db.connection import Base
from sqlalchemy import Column, Integer, ForeignKey

class Categoria_has_estoqueModel(Base):
    # nome da tabela
    __tablename__ = "categoria_has_estoque"

    # colunas
    id = Column(Integer, primary_key=True)
    qtd = Column(Integer, nullable=False)

    # chaves estrangeiras
    cardapio_id = Column(Integer, ForeignKey("cardapio.id"), nullable=False)
    estoque_id = Column(Integer, ForeignKey("estoque.id"), nullable=False)

    # construtor
    def __init__(self, qtd: int, cardapio_id: int, estoque_id: int):
        self.qtd = qtd
        self.cardapio_id = cardapio_id
        self.estoque_id = estoque_id