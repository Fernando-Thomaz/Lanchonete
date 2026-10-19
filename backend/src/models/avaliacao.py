from ..db.connection import Base
from sqlalchemy import Column, Integer, Numeric, Text

class AvaliacaoModel(Base):
    __tablename__ = "avaliacao"
    
    id = Column(Integer, primary_key=True)
    nota = Column(Numeric(10,2), nullable=False)
    comentario = Column(Text)

    def __init__(self, nota: float, comentario: str):
        self.nota = nota
        self.comentario = comentario