from ..db.connection import Base
from sqlalchemy import Column, Integer, ForeignKey

class Trabalhador_has_pedido(Base):
    __tablename__ = "trabalhador_has_pedido"

    id = Column(Integer, primary_key=True)

    trabalhador_id = Column(Integer, ForeignKey("trabalhador.id"), nullable=False)
    pedido_id = Column(Integer, ForeignKey("pedido.id"), nullable=False)

    def __init__(self, trabalhador_id: int, pedido_id: int):
        self.trabalhador_id = trabalhador_id
        self.pedido_id = pedido_id