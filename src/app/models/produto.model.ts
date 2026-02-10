export interface PrecoPorPagamento {
  credito: number;
  debito: number;
  dinheiro: number;
  pix: number;
}

export type TipoInteracaoEstoque = 'reduz' | 'nao-altera' | 'aumenta';

export interface VinculoEstoque {
  variavelEstoqueId: string;
  tipoInteracao: TipoInteracaoEstoque;
}

export interface RegistroVenda {
  id: string;
  produtoId: string;
  quantidade: number;
  dataVenda: Date;
  formaPagamento: keyof PrecoPorPagamento;
  valorTotal: number;
}

export interface Produto {
  id: string;
  nome: string;
  precos: PrecoPorPagamento;
  vinculos: VinculoEstoque[];
}

export interface ProdutoFormData {
  nome: string;
  precos: PrecoPorPagamento;
  vinculos: VinculoEstoque[];
}