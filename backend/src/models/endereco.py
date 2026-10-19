from ..db.connection import Base
from sqlalchemy import Column, Integer, String

class EnderecoModel(Base):
    __tablename__ = "endereco"

    id = Column(Integer, primary_key=True)
    rua = Column(String(255), nullable=False)
    numero = Column(Integer, nullable=False)
    cep = Column(String(255), nullable=False)
    bairro = Column(String(255))

    def __init__(self, rua: str, numero: int, cep: str, bairro: str):
        self.rua = rua
        self.numero = numero
        self.cep = cep
        self.bairro = bairro