from fastapi import HTTPException

#region ERROS Fornecedor
class ErroFornecedorNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Fornecedor não foi encontrado!!"
        )

class ErroFornecedorExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Fornecedor já existe!!"
        )
#endregion

#region ERROS Estoque
class ErroEstoqueNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Estoque não foi encontrado!!"
        )

class ErroEstoqueExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Estoque já existe!!"
        )
#endregion

#region ERROS Promocao
class ErroPromocaoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Promocao não foi encontrada!!"
        )

class ErroPromocaoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Promocao já existe!!"
        )
#endregion

#region ERROS Categoria
class ErroCategoriaNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Categoria não foi encontrada!!"
        )

class ErroCategoriaExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Categoria já existe!!"
        )
#endregion

#region ERROS Cardapio_has_estoque
class ErroCardapio_has_estoqueNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Cardapio_has_estoque não foi encontrada!!"
        )

class ErroCardapio_has_estoqueExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Cardapio_has_estoque já existe!!"
        )
#endregion

#region ERROS Avaliacao
class ErroAvaliacaoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Avaliacao não foi encontrada!!"
        )

class ErroAvaliacaoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Avaliacao já existe!!"
        )
#endregion

#region ERROS Mesa
class ErroMesaNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Mesa não foi encontrada!!"
        )

class ErroMesaExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Mesa já existe!!"
        )
#endregion

#region ERROS Cupom
class ErroCupomNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Cupom não foi encontrado!!"
        )

class ErroCupomExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Cupom já existe!!"
        )
#endregion

#region ERROS Pagamento
class ErroPagamentoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Pagamento não foi encontrado!!"
        )

class ErroPagamentoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Pagamento já existe!!"
        )
#endregion

#region ERROS Endereco
class ErroEnderecoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Endereco não foi encontrado!!"
        )

class ErroEnderecoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Endereco já existe!!"
        )
#endregion

#region ERROS Cliente
class ErroClienteNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Cliente não foi encontrado!!"
        )

class ErroClienteExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Cliente já existe!!"
        )
#endregion

#region ERROS Cliente_has_endereco
class ErroCliente_has_enderecoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Cliente_has_endereco não foi encontrado!!"
        )

class ErroCliente_has_enderecoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Cliente_has_endereco já existe!!"
        )
#endregion

#region ERROS Trabalhador
class ErroTrabalhadorNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Trabalhador não foi encontrado!!"
        )

class ErroTrabalhadorExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Trabalhador já existe!!"
        )
#endregion

#region ERROS Status_cargo
class ErroStatus_cargoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Status_cargo não foi encontrado!!"
        )

class ErroStatus_cargoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Status_cargo já existe!!"
        )
#endregion

#region ERROS Pedido
class ErroPedidoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Pedido não foi encontrado!!"
        )

class ErroPedidoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Pedido já existe!!"
        )
#endregion

#region ERROS Combo
class ErroComboNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Combo não foi encontrado!!"
        )

class ErroIs_comboExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Combo já existe!!"
        )
#endregion

#region ERROS Status_pedido
class ErroStatus_pedidoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Status_pedido não foi encontrado!!"
        )

class ErroStatus_pedidoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Status_pedido já existe!!"
        )
#endregion

#region ERROS Trabalhador_has_pedido
class ErroTrabalhador_has_pedidoNaoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail="Trabalhador_has_pedido não foi encontrado!!"
        )

class ErroTrabalhador_has_pedidoExiste(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=409,
            detail="Trabalhador_has_pedido já existe!!"
        )
#endregion

#region ERROS Inesperado
class ErroInesperado(HTTPException):
    def __init__(self, e: Exception = None):
        detalhe = f"Ocorreu um erro inesperado: {str(e)}" if e else "Ocorreu um erro inesperado!!"
        
        super().__init__(
            status_code=500,
            detail=detalhe
        )
#endregion