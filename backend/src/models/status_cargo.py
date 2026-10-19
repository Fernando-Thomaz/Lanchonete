from ..db.connection import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

class Status_cargoModel(Base):
    __tablename__ = "status_cargo"

    id = Column(Integer, primary_key=True)
    dt_inicio = Column(DateTime, nullable=False)
    dt_final = Column(DateTime)
    cargo = Column(String(255), nullable=False)

    trabalhador_id = Column(Integer, ForeignKey("trabalhador.id"),  nullable=False)

    def __init__(self, dt_inicio: datetime, dt_final: datetime, cargo: str, trabalhador_id: int):
        self.dt_inicio = dt_inicio
        self.dt_final = dt_final
        self.cargo = cargo
        self.trabalhador_id = trabalhador_id