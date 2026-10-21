from sqlalchemy import Column, Integer, String, Date, Numeric
from ..db.connection import Base
from datetime import date

class PromocaoModel(Base):
    # nome da tabela
    __tablename__ = "promocao"

    # colunas
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    dt_inicio = Column(Date, nullable=False)
    dt_final = Column(Date, nullable=False)
    valor_percentual = Column(Numeric(10,2), nullable=False)

    # construtor
    def __init__(self, nome: str, dt_inicio: date, dt_final: date, valor_percentual: float):
        self.nome = nome
        self.dt_inicio = dt_inicio
        self.dt_final = dt_final
        self.valor_percentual = valor_percentual