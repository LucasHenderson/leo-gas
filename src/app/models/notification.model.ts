export interface Notificacao {
  id: string;
  vendaId: string;
  clienteNome: string;
  valorTotal: number;
  mensagem: string;
  dataAgendada: Date;  // data/hora que a notificação deve aparecer
  lida: boolean;
  criadaEm: Date;
}