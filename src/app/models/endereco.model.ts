export interface Endereco {
  id: string;
  quadra: string;
  alameda: string;
  qi: string;
  lote: string;
  casa: string;
  complemento: string;
  clientesIds: string[];
}

export interface EnderecoFormData {
  quadra: string;
  alameda: string;
  qi: string;
  lote: string;
  casa: string;
  complemento: string;
  clientesIds: string[];
}

export interface QuadraResumo {
  quadra: string;
  totalEnderecos: number;
}