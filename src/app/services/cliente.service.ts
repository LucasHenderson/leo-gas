import { Injectable, signal, inject } from '@angular/core';
import { Cliente, ClienteFormData, HistoricoCompra } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private clientes = signal<Cliente[]>([
    {
      id: '1',
      nome: 'Maria Silva',
      telefone: '(63) 99999-1111',
      enderecosIds: ['1', '8'],
      dataCadastro: new Date('2024-01-15'),
      observacoes: 'Cliente preferencial, sempre paga no PIX'
    },
    {
      id: '2',
      nome: 'João Santos',
      telefone: '(63) 99999-2222',
      enderecosIds: ['1'],
      dataCadastro: new Date('2024-02-20'),
      observacoes: ''
    },
    {
      id: '3',
      nome: 'Ana Oliveira',
      telefone: '(63) 99999-3333',
      enderecosIds: ['2', '10'],
      dataCadastro: new Date('2024-03-10'),
      observacoes: 'Ligar antes de entregar'
    },
    {
      id: '4',
      nome: 'Carlos Ferreira',
      telefone: '(63) 99999-4444',
      enderecosIds: ['3'],
      dataCadastro: new Date('2024-04-05'),
      observacoes: ''
    },
    {
      id: '5',
      nome: 'Fernanda Costa',
      telefone: '(63) 99999-5555',
      enderecosIds: ['4', '10'],
      dataCadastro: new Date('2024-05-12'),
      observacoes: 'Prefere entregas pela manhã'
    },
    {
      id: '6',
      nome: 'Roberto Lima',
      telefone: '(63) 99999-6666',
      enderecosIds: ['4'],
      dataCadastro: new Date('2024-06-18'),
      observacoes: ''
    },
    {
      id: '7',
      nome: 'Patrícia Almeida',
      telefone: '(63) 99999-7777',
      enderecosIds: ['5'],
      dataCadastro: new Date('2024-07-22'),
      observacoes: 'Tem cachorro no quintal'
    },
    {
      id: '8',
      nome: 'Lucas Rodrigues',
      telefone: '(63) 99999-8888',
      enderecosIds: ['6'],
      dataCadastro: new Date('2024-08-30'),
      observacoes: ''
    },
    {
      id: '9',
      nome: 'Camila Martins',
      telefone: '(63) 99999-9999',
      enderecosIds: ['6'],
      dataCadastro: new Date('2024-09-15'),
      observacoes: 'Sempre compra 2 botijões'
    },
    {
      id: '10',
      nome: 'Pedro Henrique',
      telefone: '(63) 98888-0000',
      enderecosIds: ['7'],
      dataCadastro: new Date('2024-10-20'),
      observacoes: ''
    },
    {
      id: '11',
      nome: 'Juliana Souza',
      telefone: '(63) 98888-1111',
      enderecosIds: ['8'],
      dataCadastro: new Date('2024-11-25'),
      observacoes: 'Cliente nova'
    },
    {
      id: '12',
      nome: 'Ricardo Barbosa',
      telefone: '(63) 98888-2222',
      enderecosIds: ['9'],
      dataCadastro: new Date('2024-12-01'),
      observacoes: ''
    }
  ]);

  // Histórico de compras simulado
  private historicoCompras = signal<HistoricoCompra[]>([
    { id: '1', clienteId: '1', produtoNome: 'Gás P13 - Troca', quantidade: 1, valorTotal: 140, formaPagamento: 'PIX', dataCompra: new Date('2025-02-01'), enderecoEntrega: 'Qd. 104 Norte, Al. 01, Lt. 15, Casa A' },
    { id: '2', clienteId: '1', produtoNome: 'Água 20L - Troca', quantidade: 2, valorTotal: 34, formaPagamento: 'Dinheiro', dataCompra: new Date('2025-01-25'), enderecoEntrega: 'Qd. 104 Norte, Al. 01, Lt. 15, Casa A' },
    { id: '3', clienteId: '1', produtoNome: 'Gás P13 - Troca', quantidade: 1, valorTotal: 140, formaPagamento: 'PIX', dataCompra: new Date('2025-01-10'), enderecoEntrega: 'Qd. 305 Sul, Al. 01, Lt. 05' },
    { id: '4', clienteId: '2', produtoNome: 'Gás P13 - Completo', quantidade: 1, valorTotal: 350, formaPagamento: 'Crédito', dataCompra: new Date('2025-01-28'), enderecoEntrega: 'Qd. 104 Norte, Al. 01, Lt. 15, Casa A' },
    { id: '5', clienteId: '3', produtoNome: 'Gás P13 - Troca', quantidade: 2, valorTotal: 280, formaPagamento: 'PIX', dataCompra: new Date('2025-01-20'), enderecoEntrega: 'Qd. 104 Norte, Al. 03, Lt. 22' },
    { id: '6', clienteId: '3', produtoNome: 'Água 20L - Completo', quantidade: 1, valorTotal: 47, formaPagamento: 'Dinheiro', dataCompra: new Date('2025-01-05'), enderecoEntrega: 'Qd. 408 Norte, Al. 12, Lt. 33' },
    { id: '7', clienteId: '4', produtoNome: 'Gás P13 - Troca', quantidade: 1, valorTotal: 140, formaPagamento: 'Débito', dataCompra: new Date('2024-12-15'), enderecoEntrega: 'Qd. 104 Norte, Al. 05, Lt. 08, Casa B' },
    { id: '8', clienteId: '5', produtoNome: 'Gás P13 - Troca', quantidade: 1, valorTotal: 140, formaPagamento: 'PIX', dataCompra: new Date('2025-02-02'), enderecoEntrega: 'Qd. 110 Norte, Al. 02, Lt. 30' },
    { id: '9', clienteId: '5', produtoNome: 'Registro c/ Mangueira', quantidade: 1, valorTotal: 90, formaPagamento: 'Dinheiro', dataCompra: new Date('2025-01-15'), enderecoEntrega: 'Qd. 408 Norte, Al. 12, Lt. 33' },
    { id: '10', clienteId: '6', produtoNome: 'Gás P13 - Troca', quantidade: 1, valorTotal: 145, formaPagamento: 'Crédito', dataCompra: new Date('2024-11-20'), enderecoEntrega: 'Qd. 110 Norte, Al. 02, Lt. 30' },
    { id: '11', clienteId: '7', produtoNome: 'Água 20L - Troca', quantidade: 3, valorTotal: 51, formaPagamento: 'Dinheiro', dataCompra: new Date('2025-01-30'), enderecoEntrega: 'Qd. 110 Norte, Al. 10, Lt. 12, Casa C' },
    { id: '12', clienteId: '8', produtoNome: 'Gás P13 - Troca', quantidade: 1, valorTotal: 140, formaPagamento: 'PIX', dataCompra: new Date('2025-02-03'), enderecoEntrega: 'Qd. 203 Sul, Al. 04, Lt. 18' },
    { id: '13', clienteId: '9', produtoNome: 'Gás P13 - Troca', quantidade: 2, valorTotal: 280, formaPagamento: 'PIX', dataCompra: new Date('2025-01-22'), enderecoEntrega: 'Qd. 203 Sul, Al. 04, Lt. 18' },
    { id: '14', clienteId: '10', produtoNome: 'Gás P13 - Troca', quantidade: 1, valorTotal: 140, formaPagamento: 'Dinheiro', dataCompra: new Date('2024-10-25'), enderecoEntrega: 'Qd. 203 Sul, Al. 08, Lt. 25, Casa A' },
    { id: '15', clienteId: '11', produtoNome: 'Gás P13 - Completo', quantidade: 1, valorTotal: 350, formaPagamento: 'Crédito', dataCompra: new Date('2024-12-10'), enderecoEntrega: 'Qd. 305 Sul, Al. 01, Lt. 05' },
    { id: '16', clienteId: '12', produtoNome: 'Gás P13 - Troca', quantidade: 1, valorTotal: 140, formaPagamento: 'PIX', dataCompra: new Date('2024-12-20'), enderecoEntrega: 'Qd. 305 Sul, Al. 06, Lt. 14, Casa B' },
  ]);

  getClientes() {
    return this.clientes.asReadonly();
  }

  getClienteById(id: string): Cliente | undefined {
    return this.clientes().find(c => c.id === id);
  }

  getClientesByIds(ids: string[]): Cliente[] {
    return this.clientes().filter(c => ids.includes(c.id));
  }

  getTotalClientes(): number {
    return this.clientes().length;
  }

  getHistoricoCompras(clienteId: string): HistoricoCompra[] {
    return this.historicoCompras()
      .filter(h => h.clienteId === clienteId)
      .sort((a, b) => new Date(b.dataCompra).getTime() - new Date(a.dataCompra).getTime());
  }

  getUltimaCompra(clienteId: string): HistoricoCompra | undefined {
    const historico = this.getHistoricoCompras(clienteId);
    return historico.length > 0 ? historico[0] : undefined;
  }

  // Retorna clientes ordenados por última compra (mais antigos primeiro)
  getClientesSemComprasRecentes(): Cliente[] {
    const clientes = [...this.clientes()];
    
    return clientes.sort((a, b) => {
      const ultimaA = this.getUltimaCompra(a.id);
      const ultimaB = this.getUltimaCompra(b.id);
      
      // Clientes sem compras vêm primeiro
      if (!ultimaA && !ultimaB) return 0;
      if (!ultimaA) return -1;
      if (!ultimaB) return 1;
      
      // Ordena por data mais antiga primeiro
      return new Date(ultimaA.dataCompra).getTime() - new Date(ultimaB.dataCompra).getTime();
    });
  }

  createCliente(data: ClienteFormData): Cliente {
    const newCliente: Cliente = {
      id: this.generateId(),
      ...data
    };

    this.clientes.update(list => [...list, newCliente]);
    return newCliente;
  }

  updateCliente(id: string, data: ClienteFormData): boolean {
    this.clientes.update(list =>
      list.map(c => c.id === id ? { ...c, ...data } : c)
    );
    return true;
  }

  deleteCliente(id: string): string[] {
    const cliente = this.clientes().find(c => c.id === id);
    const enderecosAfetados = cliente?.enderecosIds || [];
    
    this.clientes.update(list => list.filter(c => c.id !== id));
    
    // Remove também o histórico de compras
    this.historicoCompras.update(list => list.filter(h => h.clienteId !== id));
    
    return enderecosAfetados;
  }

  // Adiciona endereço ao cliente
  vincularEndereco(clienteId: string, enderecoId: string): void {
    this.clientes.update(list =>
      list.map(c => {
        if (c.id === clienteId && !c.enderecosIds.includes(enderecoId)) {
          return { ...c, enderecosIds: [...c.enderecosIds, enderecoId] };
        }
        return c;
      })
    );
  }

  // Remove endereço do cliente
  desvincularEndereco(clienteId: string, enderecoId: string): void {
    this.clientes.update(list =>
      list.map(c => {
        if (c.id === clienteId) {
          return { ...c, enderecosIds: c.enderecosIds.filter(id => id !== enderecoId) };
        }
        return c;
      })
    );
  }

  // Remove endereço de todos os clientes
  removerEnderecosDeTodosClientes(enderecoId: string): void {
    this.clientes.update(list =>
      list.map(c => ({
        ...c,
        enderecosIds: c.enderecosIds.filter(id => id !== enderecoId)
      }))
    );
  }

  // Formata telefone para link do WhatsApp
  getWhatsAppLink(telefone: string): string {
    const numero = telefone.replace(/\D/g, '');
    const numeroComDDI = numero.startsWith('55') ? numero : `55${numero}`;
    return `https://wa.me/${numeroComDDI}`;
  }

  // Gera texto para copiar com dados do cliente
  gerarTextoCadastro(cliente: Cliente, enderecos: string[]): string {
    let texto = `✅ *Cadastro Realizado - Léo Gás*\n\n`;
    texto += `👤 *Cliente:* ${cliente.nome || 'Não informado'}\n`;
    texto += `📱 *Telefone:* ${cliente.telefone || 'Não informado'}\n`;
    texto += `📅 *Data de Cadastro:* ${this.formatarData(cliente.dataCadastro)}\n`;
    
    if (enderecos.length > 0) {
      texto += `\n📍 *Endereço(s):*\n`;
      enderecos.forEach((end, i) => {
        texto += `   ${i + 1}. ${end}\n`;
      });
    }
    
    if (cliente.observacoes) {
      texto += `\n📝 *Observações:* ${cliente.observacoes}\n`;
    }
    
    texto += `\nInformações estão corretas? ✅`;
    return texto;
  }

  // Gera texto com dados e histórico do cliente
  gerarTextoResumo(cliente: Cliente, enderecos: string[], historico: HistoricoCompra[]): string {
    let texto = `📋 *Resumo do Cliente - Léo Gás*\n\n`;
    texto += `👤 *Nome:* ${cliente.nome || 'Não informado'}\n`;
    texto += `📱 *Telefone:* ${cliente.telefone || 'Não informado'}\n`;
    
    if (enderecos.length > 0) {
      texto += `\n📍 *Endereço(s):*\n`;
      enderecos.forEach((end, i) => {
        texto += `   ${i + 1}. ${end}\n`;
      });
    }
    
    if (historico.length > 0) {
      texto += `\n🛒 *Últimos Pedidos:*\n`;
      historico.slice(0, 3).forEach((h, i) => {
        texto += `   ${i + 1}. ${h.produtoNome} (${h.quantidade}x) - R$ ${h.valorTotal.toFixed(2).replace('.', ',')} - ${this.formatarData(h.dataCompra)}\n`;
      });
    } else {
      texto += `\n🛒 *Pedidos:* Nenhum pedido registrado\n`;
    }
    
    texto += `\n_Obrigado pela preferência!_ 🔥`;
    return texto;
  }

  private formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}