from ..db.connection import Base
from sqlalchemy import Column, Integer, Numeric

class PagamentoModel(Base):
    __tablename__ = "pagamento"

    id = Column(Integer, primary_key=True)
    dinheiro = Column(Numeric(10,2))
    pix = Column(Numeric(10,2))
    cartao = Column(Numeric(10,2))

    def __init__(self, dinheiro: float, pix: float, cartao: float):
        self.dinheiro = dinheiro
        self.pix = pix
        self.cartao = cartao