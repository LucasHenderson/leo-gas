export interface Entregador {
  id: string;
  nomeCompleto: string;
  telefone: string;
  identificador: string;
  ativo: boolean;
  dataCadastro: Date;
}

export interface EntregadorFormData {
  nomeCompleto: string;
  telefone: string;
  identificador: string;
}