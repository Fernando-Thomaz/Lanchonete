from ..db.connection import Base
from sqlalchemy import Column, Integer, String, ForeignKey

class PedidoModel(Base):
    __tablename__ = "pedido"

    id = Column(Integer, primary_key=True)
    tipo_pedido = Column(String(255), nullable=False)
    tipo_entrega = Column(String(255), nullable=False)
    variacao_pedido = Column(String(255))
    adicional_pedido = Column(String(255))
    observacao_pedido = Column(String(255))

    cliente_id = Column(Integer, ForeignKey("cliente.id"))
    mesa_id = Column(Integer, ForeignKey("mesa.id"))
    cupom_id = Column(Integer, ForeignKey("cupom.id"))
    avaliacao_id = Column(Integer, ForeignKey("avaliacao.id"))
    pagamento_id = Column(Integer, ForeignKey("pagamento.id"), nullable=False)

    def __init__(self, tipo_pedido: str, tipo_entrega: str, variacao_pedido: str, adicional_pedido: str, observacao_pedido: str, cliente_id: int, mesa_id: int, cupom_id: int, avaliacao_id: int, pagamento_id: int):
        self.tipo_pedido = tipo_pedido
        self.tipo_entrega = tipo_entrega
        self.variacao_pedido = variacao_pedido
        self.adicional_pedido = adicional_pedido
        self.observacao_pedido = observacao_pedido
        self.cliente_id = cliente_id
        self.mesa_id = mesa_id
        self.cupom_id = cupom_id
        self.avaliacao_id = avaliacao_id
        self.pagamento_id = pagamento_id