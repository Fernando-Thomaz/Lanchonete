from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.avaliacao import avaliacao_router
from .routes.cardapio import cardapio_router
from .routes.categoria import categoria_router
from .routes.cliente import cliente_router
from .routes.cupom import cupom_router
from .routes.endereco import endereco_router
from .routes.estoque import estoque_router
from .routes.fornecedor import fornecedor_router
from .routes.is_combo import is_combo_router
from .routes.mesa import mesa_router
from .routes.pagamento import pagamento_router
from .routes.pedido import pedido_router
from .routes.promocao import promocao_router
from .routes.status_cargo import status_cargo_router
from .routes.status_pedido import status_pedido_router
from .routes.trabalhador import trabalhador_router

# inicia o FastAPI
app = FastAPI(title="Lanchonete", description="Api para controle de entrada e saida do estoque da lanchonete e gestao de pedidos.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(avaliacao_router)
app.include_router(cardapio_router)
app.include_router(categoria_router)
app.include_router(cliente_router)
app.include_router(cupom_router)
app.include_router(endereco_router)
app.include_router(estoque_router)
app.include_router(fornecedor_router)
app.include_router(is_combo_router)
app.include_router(mesa_router)
app.include_router(pagamento_router)
app.include_router(pedido_router)
app.include_router(promocao_router)
app.include_router(status_cargo_router)
app.include_router(status_pedido_router)
app.include_router(trabalhador_router)