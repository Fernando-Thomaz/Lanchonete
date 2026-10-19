from ..db.connection import Base
from sqlalchemy import Column, Integer, String

class FornecedorModel(Base):
    __tablename__ = "fornecedor"

    id = Column(Integer, primary_key=True, nullable=False)
    nome = Column(String(100), nullable=False)
    contato = Column(String, nullable=False, unique=True)

    def __init__(self, nome: str, contato: str):
        self.nome = nome
        self.contato = contato