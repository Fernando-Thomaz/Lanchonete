from ..db.connection import Base
from sqlalchemy import Column, Integer, String

class CategoriaModel(Base):
    # nome da tabela
    __tablename__ = "categoria"

    # colunas
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False, unique=True)

    # construtor
    def __init__(self, nome: str):
        self.nome = nome