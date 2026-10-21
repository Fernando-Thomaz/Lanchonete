from ..db.connection import Base
from sqlalchemy import Column, Integer, Numeric, Text

class AvaliacaoModel(Base):
    # nome da tabela
    __tablename__ = "avaliacao"

    # colunas
    id = Column(Integer, primary_key=True)
    nota = Column(Numeric(10,2), nullable=False)
    comentario = Column(Text)

    # construtor
    def __init__(self, nota: float, comentario: str):
        self.nota = nota
        self.comentario = comentario