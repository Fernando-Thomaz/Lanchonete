from ..db.connection import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

class Status_pedidoModel(Base):
    # nome da tabela
    __tablename__ = "status_pedido"

    # colunas
    id = Column(Integer, primary_key=True)
    status_pedido = Column(String(255), nullable=False)
    dt = Column(DateTime, nullable=False)

    # chave estrangeira
    pedido_id = Column(Integer, ForeignKey("pedido.id"), nullable=False)

    # construtor
    def __init__(self, status_pedido: str, dt: datetime, pedido_id: int):
        self.status_pedido = status_pedido
        self.dt = dt
        self.pedido_id = pedido_id