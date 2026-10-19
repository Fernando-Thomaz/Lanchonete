from ..db.connection import Base
from sqlalchemy import Column, Integer, ForeignKey

class Is_comboModel(Base):
    __tablename__ = "is_combo"

    id = Column(Integer, primary_key=True)

    cardapio_id = Column(Integer, ForeignKey("cardapio.id"))
    pedido_id = Column(Integer, ForeignKey("pedido.id"))

    def __init__(self, cardapio_id: int, pedido_id: int):
        self.cardapio_id = cardapio_id
        self.pedido_id = pedido_id