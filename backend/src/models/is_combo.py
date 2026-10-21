from ..db.connection import Base
from sqlalchemy import Column, Integer, ForeignKey

class Is_comboModel(Base):
    # nome da tabela
    __tablename__ = "is_combo"

    # coluna
    id = Column(Integer, primary_key=True)

    # chave estrangeiras
    cardapio_id = Column(Integer, ForeignKey("cardapio.id"))
    pedido_id = Column(Integer, ForeignKey("pedido.id"))

    # construtor
    def __init__(self, cardapio_id: int, pedido_id: int):
        self.cardapio_id = cardapio_id
        self.pedido_id = pedido_id