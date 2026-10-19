from ..db.connection import Base
from sqlalchemy import Column, Integer, String, Numeric, Date
from datetime import date

class CupomModel(Base):
    __tablename__ = "cupom"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    valor_percentual = Column(Numeric(10,2), nullable=False)
    validade = Column(Date, nullable=False)

    def __init__(self, nome: str, valor_percentual: float, validade: date):
        self.nome = nome
        self.valor_percentual = valor_percentual
        self.validade = validade