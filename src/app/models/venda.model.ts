export type StatusVenda = 'a-entregar' | 'entregando' | 'entregue';
export type FormaPagamento = 'credito' | 'debito' | 'dinheiro' | 'pix';

export interface ItemVenda {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PagamentoVenda {
  forma: FormaPagamento;
  valor: number;
}

export interface Venda {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  enderecoId: string;
  enderecoFormatado: string;
  entregadorId: string;
  entregadorIdentificador: string;
  itens: ItemVenda[];
  pagamentos: PagamentoVenda[];
  valorTotal: number;
  status: StatusVenda;
  recebimentoPendente: boolean;
  dataVenda: Date;
  observacoes: string;
}

export interface VendaFormData {
  clienteId: string;
  enderecoId: string;
  entregadorId: string;
  itens: ItemVenda[];
  pagamentos: PagamentoVenda[];
  valorTotal: number;
  observacoes: string;
}