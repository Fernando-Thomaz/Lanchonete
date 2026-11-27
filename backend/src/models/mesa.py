from ..db.connection import Base
from sqlalchemy import Column, Integer, String, Boolean

class MesaModel(Base):
    # nome da tabela
    __tablename__ = "mesa"

    # colunas
    id = Column(Integer, primary_key=True)
    qtd_cadeira = Column(Integer, nullable=False)
    numero = Column(Integer, nullable=False, unique=True)
    ocupada = Column(Boolean, nullable=False, default=False)

    # construtor
    def __init__(self, qtd_cadeira: int, numero: int, ocupada: bool = False):
        self.qtd_cadeira = qtd_cadeira
        self.numero = numero
        self.ocupada = ocupada