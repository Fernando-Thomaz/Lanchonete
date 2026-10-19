from ..db.connection import Base
from sqlalchemy import Column, Integer, ForeignKey

class Cliente_has_enderecoModel(Base):
    __tablename__ = "cliente_has_endereco"

    id = Column(Integer, primary_key=True)
    endereco_id = Column(Integer, ForeignKey("endereco.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("cliente.id"), nullable=False)

    def __init__(self, endereco_id: int, cliente_id: int):
        self.endereco_id = endereco_id
        self.cliente_id = cliente_id