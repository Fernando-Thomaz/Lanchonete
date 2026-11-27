from ..db.connection import Base
from sqlalchemy import Column, Integer, String

class TrabalhadorModel(Base):
    # nome da tabela
    __tablename__ = "trabalhador"

    # colunas
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    contato = Column(String(255), nullable=False, unique=True)

    # construtor
    def __init__(self, nome: str, contato: str):
        self.nome = nome
        self.contato = contato