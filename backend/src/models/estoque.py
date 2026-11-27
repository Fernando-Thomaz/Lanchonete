from ..db.connection import Base
from sqlalchemy import Column, String, Integer, ForeignKey

class EstoqueModel(Base):
    # nome da tabela
    __tablename__ = "estoque"

    # colunas
    id = Column(Integer, primary_key=True)
    nome = Column(String(255), nullable=False, unique=True)
    qtd = Column(Integer, nullable=False)
    unidade_medida = Column(String(50), nullable=False)

    # chave estrangeira
    fornecedor_id = Column(Integer, ForeignKey("fornecedor.id"), nullable=False)

    # construtor
    def __init__(self, nome: str, qtd: int, unidade_medida: str, fornecedor_id: int):
        self.nome = nome
        self.qtd = qtd
        self.unidade_medida = unidade_medida
        self.fornecedor_id = fornecedor_id