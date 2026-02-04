export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  enderecosIds: string[];
  dataCadastro: Date;
  observacoes: string;
}

export interface ClienteFormData {
  nome: string;
  telefone: string;
  enderecosIds: string[];
  dataCadastro: Date;
  observacoes: string;
}

export interface HistoricoCompra {
  id: string;
  clienteId: string;
  produtoNome: string;
  quantidade: number;
  valorTotal: number;
  formaPagamento: string;
  dataCompra: Date;
  enderecoEntrega: string;
}