from ..db.connection import Base
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey

class CardapioModel(Base):
    # nome da tabela
    __tablename__ = "cardapio"

    # colunas
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False, unique=True)
    preco_base = Column(Numeric(10,2), nullable=False)

    # chaves estrangeiras
    categoria_id = Column(Integer, ForeignKey("categoria.id"), nullable=False)
    promocao_id = Column(Integer, ForeignKey("promocao.id"), nullable=False)

    # construtor
    def __init__(self, nome: str, preco_base: float, categoria_id: int, promocao_id: int):
        self.nome = nome
        self.preco_base = preco_base
        self.categoria_id = categoria_id
        self.promocao_id = promocao_id