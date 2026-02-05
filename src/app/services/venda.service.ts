import { Injectable, signal, inject } from '@angular/core';
import { Venda, VendaFormData, StatusVenda } from '../models/venda.model';
import { ClienteService } from './cliente.service';
import { EnderecoService } from './endereco.service';
import { EntregadorService } from './entregador.service';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private clienteService = inject(ClienteService);
  private enderecoService = inject(EnderecoService);
  private entregadorService = inject(EntregadorService);

  private vendas = signal<Venda[]>([
    {
      id: '1',
      clienteId: '1',
      clienteNome: 'Maria Silva',
      clienteTelefone: '(63) 99999-1111',
      enderecoId: '1',
      enderecoFormatado: 'Qd. 104 Norte, Al. 01, Lt. 15, Casa A',
      entregadorId: '1',
      entregadorIdentificador: 'JPS',
      itens: [
        {
          produtoId: '1',
          produtoNome: 'Gás P13 - Troca',
          quantidade: 1,
          precoUnitario: 140,
          subtotal: 140
        }
      ],
      pagamentos: [{ forma: 'pix', valor: 140 }],
      valorTotal: 140,
      status: 'entregue',
      recebimentoPendente: false,
      dataVenda: new Date('2025-02-01'),
      observacoes: ''
    },
    {
      id: '2',
      clienteId: '1',
      clienteNome: 'Maria Silva',
      clienteTelefone: '(63) 99999-1111',
      enderecoId: '1',
      enderecoFormatado: 'Qd. 104 Norte, Al. 01, Lt. 15, Casa A',
      entregadorId: '2',
      entregadorIdentificador: 'MOS',
      itens: [
        {
          produtoId: '2',
          produtoNome: 'Água 20L - Troca',
          quantidade: 2,
          precoUnitario: 17,
          subtotal: 34
        }
      ],
      pagamentos: [{ forma: 'dinheiro', valor: 34 }],
      valorTotal: 34,
      status: 'entregue',
      recebimentoPendente: false,
      dataVenda: new Date('2025-01-25'),
      observacoes: ''
    },
    {
      id: '3',
      clienteId: '2',
      clienteNome: 'João Santos',
      clienteTelefone: '(63) 99999-2222',
      enderecoId: '1',
      enderecoFormatado: 'Qd. 104 Norte, Al. 01, Lt. 15, Casa A',
      entregadorId: '1',
      entregadorIdentificador: 'JPS',
      itens: [
        {
          produtoId: '1',
          produtoNome: 'Gás P13 - Troca',
          quantidade: 1,
          precoUnitario: 145,
          subtotal: 145
        }
      ],
      pagamentos: [{ forma: 'credito', valor: 145 }],
      valorTotal: 145,
      status: 'entregue',
      recebimentoPendente: false,
      dataVenda: new Date('2025-01-28'),
      observacoes: ''
    },
    {
      id: '4',
      clienteId: '3',
      clienteNome: 'Ana Oliveira',
      clienteTelefone: '(63) 99999-3333',
      enderecoId: '2',
      enderecoFormatado: 'Qd. 104 Norte, Al. 03, Lt. 22',
      entregadorId: '3',
      entregadorIdentificador: 'CFL',
      itens: [
        {
          produtoId: '1',
          produtoNome: 'Gás P13 - Troca',
          quantidade: 2,
          precoUnitario: 140,
          subtotal: 280
        }
      ],
      pagamentos: [
        { forma: 'dinheiro', valor: 100 },
        { forma: 'pix', valor: 180 }
      ],
      valorTotal: 280,
      status: 'entregue',
      recebimentoPendente: false,
      dataVenda: new Date('2025-01-20'),
      observacoes: 'Pagamento misto'
    },
    {
      id: '5',
      clienteId: '5',
      clienteNome: 'Fernanda Costa',
      clienteTelefone: '(63) 99999-5555',
      enderecoId: '4',
      enderecoFormatado: 'Qd. 110 Norte, Al. 02, Lt. 30',
      entregadorId: '1',
      entregadorIdentificador: 'JPS',
      itens: [
        {
          produtoId: '1',
          produtoNome: 'Gás P13 - Troca',
          quantidade: 1,
          precoUnitario: 140,
          subtotal: 140
        }
      ],
      pagamentos: [{ forma: 'pix', valor: 140 }],
      valorTotal: 140,
      status: 'a-entregar',
      recebimentoPendente: false,
      dataVenda: new Date('2025-02-05'),
      observacoes: 'Prefere entregas pela manhã'
    },
    {
      id: '6',
      clienteId: '8',
      clienteNome: 'Lucas Rodrigues',
      clienteTelefone: '(63) 99999-8888',
      enderecoId: '6',
      enderecoFormatado: 'Qd. 203 Sul, Al. 04, Lt. 18',
      entregadorId: '2',
      entregadorIdentificador: 'MOS',
      itens: [
        {
          produtoId: '1',
          produtoNome: 'Gás P13 - Troca',
          quantidade: 1,
          precoUnitario: 140,
          subtotal: 140
        }
      ],
      pagamentos: [{ forma: 'dinheiro', valor: 140 }],
      valorTotal: 140,
      status: 'entregando',
      recebimentoPendente: false,
      dataVenda: new Date('2025-02-05'),
      observacoes: ''
    },
    {
      id: '7',
      clienteId: '9',
      clienteNome: 'Camila Martins',
      clienteTelefone: '(63) 99999-9999',
      enderecoId: '6',
      enderecoFormatado: 'Qd. 203 Sul, Al. 04, Lt. 18',
      entregadorId: '4',
      entregadorIdentificador: 'RSN',
      itens: [
        {
          produtoId: '1',
          produtoNome: 'Gás P13 - Troca',
          quantidade: 2,
          precoUnitario: 140,
          subtotal: 280
        }
      ],
      pagamentos: [{ forma: 'debito', valor: 280 }],
      valorTotal: 280,
      status: 'a-entregar',
      recebimentoPendente: false,
      dataVenda: new Date('2025-02-05'),
      observacoes: 'Sempre compra 2 botijões'
    }
  ]);

  getVendas() {
    return this.vendas.asReadonly();
  }

  getVendaById(id: string): Venda | undefined {
    return this.vendas().find(v => v.id === id);
  }

  getTotalVendas(): number {
    return this.vendas().length;
  }

  createVenda(data: VendaFormData): Venda {
    const cliente = this.clienteService.getClienteById(data.clienteId);
    const endereco = this.enderecoService.getEnderecoById(data.enderecoId);
    const entregador = this.entregadorService.getEntregadores()().find(e => e.id === data.entregadorId);

    const newVenda: Venda = {
      id: this.generateId(),
      clienteId: data.clienteId,
      clienteNome: cliente?.nome || '',
      clienteTelefone: cliente?.telefone || '',
      enderecoId: data.enderecoId,
      enderecoFormatado: endereco ? this.enderecoService.getEnderecoFormatado(endereco) : '',
      entregadorId: data.entregadorId,
      entregadorIdentificador: entregador?.identificador || '',
      itens: data.itens,
      pagamentos: data.pagamentos,
      valorTotal: data.valorTotal,
      status: 'a-entregar',
      recebimentoPendente: false,
      dataVenda: new Date(),
      observacoes: data.observacoes
    };

    this.vendas.update(list => [...list, newVenda]);
    return newVenda;
  }

  updateVenda(id: string, data: Partial<VendaFormData>): boolean {
    const venda = this.vendas().find(v => v.id === id);
    if (!venda) return false;

    const cliente = data.clienteId ? this.clienteService.getClienteById(data.clienteId) : undefined;
    const endereco = data.enderecoId ? this.enderecoService.getEnderecoById(data.enderecoId) : undefined;
    const entregador = data.entregadorId ? this.entregadorService.getEntregadores()().find(e => e.id === data.entregadorId) : undefined;

    this.vendas.update(list =>
      list.map(v => {
        if (v.id === id) {
          return {
            ...v,
            ...(data.clienteId && { 
              clienteId: data.clienteId,
              clienteNome: cliente?.nome || v.clienteNome,
              clienteTelefone: cliente?.telefone || v.clienteTelefone
            }),
            ...(data.enderecoId && { 
              enderecoId: data.enderecoId,
              enderecoFormatado: endereco ? this.enderecoService.getEnderecoFormatado(endereco) : v.enderecoFormatado
            }),
            ...(data.entregadorId && { 
              entregadorId: data.entregadorId,
              entregadorIdentificador: entregador?.identificador || v.entregadorIdentificador
            }),
            ...(data.itens && { itens: data.itens }),
            ...(data.pagamentos && { pagamentos: data.pagamentos }),
            ...(data.valorTotal !== undefined && { valorTotal: data.valorTotal }),
            ...(data.observacoes !== undefined && { observacoes: data.observacoes })
          };
        }
        return v;
      })
    );
    return true;
  }

  updateStatus(id: string, status: StatusVenda): void {
    this.vendas.update(list =>
      list.map(v => v.id === id ? { ...v, status } : v)
    );
  }

  toggleRecebimentoPendente(id: string): void {
    this.vendas.update(list =>
      list.map(v => v.id === id ? { ...v, recebimentoPendente: !v.recebimentoPendente } : v)
    );
  }

  deleteVenda(id: string): void {
    this.vendas.update(list => list.filter(v => v.id !== id));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}