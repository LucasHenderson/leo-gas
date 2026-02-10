import { Injectable, signal, inject } from '@angular/core';
import { Venda, VendaFormData, StatusVenda, PagamentoVenda } from '../models/venda.model';
import { ClienteService } from './cliente.service';
import { EnderecoService } from './endereco.service';
import { EntregadorService } from './entregador.service';
import { ProdutoService } from './produto.service';
import { VariavelEstoqueService } from './variavel-estoque.service';
import { HistoricoCompra } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private clienteService = inject(ClienteService);
  private enderecoService = inject(EnderecoService);
  private entregadorService = inject(EntregadorService);
  private produtoService = inject(ProdutoService);
  private variavelEstoqueService = inject(VariavelEstoqueService);

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

  // ===== MÉTODO MODIFICADO: Integração completa ao criar venda =====
  createVenda(data: VendaFormData): Venda | null {
    const cliente = this.clienteService.getClienteById(data.clienteId);
    const endereco = this.enderecoService.getEnderecoById(data.enderecoId);
    const entregador = this.entregadorService.getEntregadores()().find(e => e.id === data.entregadorId);

    // Verifica se tem estoque suficiente ANTES de criar a venda
    for (const item of data.itens) {
      const produto = this.produtoService.getProdutos()().find(p => p.id === item.produtoId);
      if (!produto) {
        console.error(`Produto ${item.produtoId} não encontrado`);
        return null;
      }

      // Verifica os vínculos do produto com variáveis de estoque
      for (const vinculo of produto.vinculos) {
        if (vinculo.tipoInteracao === 'reduz') {
          const variavel = this.variavelEstoqueService.getVariavelById(vinculo.variavelEstoqueId);
          if (!variavel || variavel.quantidade < item.quantidade) {
            console.error(`Estoque insuficiente para ${variavel?.nome || 'variável desconhecida'}`);
            return null;
          }
        }
      }
    }

    // Cria a venda
    const vendaId = this.generateId();
    const newVenda: Venda = {
      id: vendaId,
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

    // Processa cada item da venda
    data.itens.forEach((item, index) => {
      const produto = this.produtoService.getProdutos()().find(p => p.id === item.produtoId);
      if (!produto) return;

      // 1. REDUZ ESTOQUE das variáveis vinculadas ao produto
      // 1. AJUSTA ESTOQUE das variáveis vinculadas ao produto
      for (const vinculo of produto.vinculos) {
        if (vinculo.tipoInteracao === 'reduz') {
          this.variavelEstoqueService.reduzirEstoque(
            vinculo.variavelEstoqueId, 
            item.quantidade
          );
        } else if (vinculo.tipoInteracao === 'aumenta') {
          this.variavelEstoqueService.aumentarEstoque(
            vinculo.variavelEstoqueId, 
            item.quantidade
          );
        }
        // 'nao-altera' não faz nada
      }

      // 2. REGISTRA VENDA NO PRODUTO (para contadores e estatísticas)
      // Passa vendaId para permitir rastreamento e remoção posterior
      const formaPagamentoPrincipal = data.pagamentos[0]?.forma || 'dinheiro';
      this.produtoService.registrarVenda(
        item.produtoId,
        item.quantidade,
        formaPagamentoPrincipal as any,
        item.subtotal,
        vendaId  // Passa o vendaId para rastreamento
      );

      // 3. ADICIONA AO HISTÓRICO DO CLIENTE
      // Usa vendaId + índice como prefixo no ID da compra (permite múltiplos itens do mesmo produto)
      const historicoCompra: HistoricoCompra = {
        id: `${vendaId}_item_${index}_${item.produtoId}`,
        clienteId: data.clienteId,
        produtoNome: item.produtoNome,
        quantidade: item.quantidade,
        valorTotal: item.subtotal,  // Valor INDIVIDUAL do item
        formaPagamento: formaPagamentoPrincipal as any,
        dataCompra: new Date(),
        enderecoEntrega: newVenda.enderecoFormatado
      };
      this.clienteService.adicionarCompra(historicoCompra);
    });

    // Adiciona a venda à lista
    this.vendas.update(list => [...list, newVenda]);
    
    console.log(`✅ Venda criada com sucesso! Estoque, histórico e contadores atualizados.`);
    return newVenda;
  }
  // ==================================================================

  // ===== MÉTODO MODIFICADO: Atualiza venda e ajusta todas as alterações =====
  updateVenda(id: string, data: Partial<VendaFormData>): boolean {
    const vendaOriginal = this.vendas().find(v => v.id === id);
    if (!vendaOriginal) return false;

    // Calcula o impacto nos valores do entregador ANTES da alteração
    const valorEntregadorAntes = this.calcularValorParaEntregador(vendaOriginal.pagamentos);

    // Se os ITENS foram alterados, precisa reverter e reaplicar
    if (data.itens && data.itens.length > 0) {
      // 1. REVERTE as alterações dos itens originais (APENAS ESTOQUE)
      for (const itemOriginal of vendaOriginal.itens) {
        const produto = this.produtoService.getProdutos()().find(p => p.id === itemOriginal.produtoId);
        if (!produto) continue;

        // Reverte APENAS o estoque (não mexe nos contadores de vendas)
        for (const vinculo of produto.vinculos) {
          if (vinculo.tipoInteracao === 'reduz') {
            // Se tinha reduzido, agora aumenta de volta
            this.variavelEstoqueService.aumentarEstoque(
              vinculo.variavelEstoqueId, 
              itemOriginal.quantidade
            );
          } else if (vinculo.tipoInteracao === 'aumenta') {
            // Se tinha aumentado, agora reduz de volta
            this.variavelEstoqueService.reduzirEstoque(
              vinculo.variavelEstoqueId, 
              itemOriginal.quantidade
            );
          }
        }
      }

      // Remove histórico relacionado à venda original
      this.clienteService.removerComprasPorVenda(id);

      // 2. APLICA as novas alterações (APENAS ESTOQUE E HISTÓRICO)
      // Usa índice para garantir IDs únicos mesmo com produtos duplicados
      data.itens.forEach((novoItem, index) => {
        const produto = this.produtoService.getProdutos()().find(p => p.id === novoItem.produtoId);
        if (!produto) return;

        // Aplica novo estoque
        for (const vinculo of produto.vinculos) {
          if (vinculo.tipoInteracao === 'reduz') {
            this.variavelEstoqueService.reduzirEstoque(
              vinculo.variavelEstoqueId, 
              novoItem.quantidade
            );
          } else if (vinculo.tipoInteracao === 'aumenta') {
            this.variavelEstoqueService.aumentarEstoque(
              vinculo.variavelEstoqueId, 
              novoItem.quantidade
            );
          }
        }

        // Adiciona ao histórico do cliente com valores atualizados INDIVIDUAIS
        const clienteId = data.clienteId || vendaOriginal.clienteId;
        const endereco = data.enderecoId 
          ? this.enderecoService.getEnderecoById(data.enderecoId)
          : this.enderecoService.getEnderecoById(vendaOriginal.enderecoId);
        
        const formaPagamentoPrincipal = data.pagamentos?.[0]?.forma || vendaOriginal.pagamentos[0]?.forma || 'dinheiro';
        
        // ID único por item usando índice (permite múltiplos itens do mesmo produto)
        const historicoCompra: HistoricoCompra = {
          id: `${id}_item_${index}_${novoItem.produtoId}`,
          clienteId: clienteId,
          produtoNome: novoItem.produtoNome,
          quantidade: novoItem.quantidade,
          valorTotal: novoItem.subtotal,  // Valor INDIVIDUAL do item (já calculado)
          formaPagamento: formaPagamentoPrincipal as any,
          dataCompra: vendaOriginal.dataVenda, // Mantém a data original da venda
          enderecoEntrega: endereco ? this.enderecoService.getEnderecoFormatado(endereco) : vendaOriginal.enderecoFormatado
        };
        this.clienteService.adicionarCompra(historicoCompra);
        
        console.log(`   ✓ Histórico atualizado: ${novoItem.produtoNome} - R$ ${novoItem.subtotal.toFixed(2)}`);
      });

      console.log(`✅ Venda ${id} atualizada. Estoque e histórico ajustados (contadores de vendas mantidos).`);
    }

    // Atualiza os dados da venda
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

    // Calcula o impacto nos valores do entregador DEPOIS da alteração
    const pagamentosNovos = data.pagamentos || vendaOriginal.pagamentos;
    const valorEntregadorDepois = this.calcularValorParaEntregador(pagamentosNovos);
    const diferencaEntregador = valorEntregadorDepois - valorEntregadorAntes;

    // Log do impacto financeiro
    if (Math.abs(diferencaEntregador) > 0.01) {
      const entregadorNome = entregador?.identificador || vendaOriginal.entregadorIdentificador;
      console.log(`💰 Impacto no caixa de ${entregadorNome}: R$ ${valorEntregadorAntes.toFixed(2)} → R$ ${valorEntregadorDepois.toFixed(2)} (${diferencaEntregador > 0 ? '+' : ''}${diferencaEntregador.toFixed(2)})`);
    }

    return true;
  }
  // ========================================================================

  // Método auxiliar para calcular valor para entregador (pagamentos exceto PIX)
  private calcularValorParaEntregador(pagamentos: PagamentoVenda[]): number {
    return pagamentos
      .filter(p => p.forma !== 'pix')
      .reduce((sum, p) => sum + p.valor, 0);
  }

  // ===== MÉTODO MODIFICADO: Deleta venda e reverte todas as alterações =====
  deleteVenda(id: string): boolean {
    const venda = this.vendas().find(v => v.id === id);
    if (!venda) return false;

    // REVERTE todas as operações para cada item da venda
    for (const item of venda.itens) {
      const produto = this.produtoService.getProdutos()().find(p => p.id === item.produtoId);
      if (!produto) continue;

      // 1. REVERTE O ESTOQUE - Devolve ao estoque
      for (const vinculo of produto.vinculos) {
        if (vinculo.tipoInteracao === 'reduz') {
          // Se tinha reduzido, agora aumenta de volta
          this.variavelEstoqueService.aumentarEstoque(
            vinculo.variavelEstoqueId, 
            item.quantidade
          );
        } else if (vinculo.tipoInteracao === 'aumenta') {
          // Se tinha aumentado, agora reduz de volta
          this.variavelEstoqueService.reduzirEstoque(
            vinculo.variavelEstoqueId, 
            item.quantidade
          );
        }
        // 'nao-altera' não precisa reverter nada
      }
    }

    // 2. REMOVE VENDAS REGISTRADAS DO PRODUTO
    // Remove todos os registros de vendas que começam com o ID da venda
    const removidos = this.produtoService.removerVendasPorPrefixo(venda.id);
    console.log(`   - Removidos ${removidos} registros de vendas dos produtos`);

    // 3. REMOVE DO HISTÓRICO DO CLIENTE
    this.clienteService.removerComprasPorVenda(venda.id);

    // 4. Remove a venda da lista
    this.vendas.update(list => list.filter(v => v.id !== id));
    
    console.log(`✅ Venda ${id} excluída. Estoque, histórico e contadores revertidos.`);
    return true;
  }
  // ========================================================================

  updateStatus(id: string, status: StatusVenda): boolean {
    const venda = this.vendas().find(v => v.id === id);
    if (!venda) return false;

    this.vendas.update(list =>
      list.map(v => v.id === id ? { ...v, status } : v)
    );
    return true;
  }

  updateRecebimentoPendente(id: string, pendente: boolean): boolean {
    const venda = this.vendas().find(v => v.id === id);
    if (!venda) return false;

    this.vendas.update(list =>
      list.map(v => v.id === id ? { ...v, recebimentoPendente: pendente } : v)
    );
    return true;
  }

  // Método auxiliar para alternar o status de recebimento pendente
  toggleRecebimentoPendente(id: string): boolean {
    const venda = this.vendas().find(v => v.id === id);
    if (!venda) return false;

    this.vendas.update(list =>
      list.map(v => v.id === id ? { ...v, recebimentoPendente: !v.recebimentoPendente } : v)
    );
    return true;
  }

  // Estatísticas
  getTotalVendasHoje(): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return this.vendas().filter(v => {
      const dataVenda = new Date(v.dataVenda);
      dataVenda.setHours(0, 0, 0, 0);
      return dataVenda.getTime() === hoje.getTime();
    }).length;
  }

  getValorTotalVendasHoje(): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return this.vendas()
      .filter(v => {
        const dataVenda = new Date(v.dataVenda);
        dataVenda.setHours(0, 0, 0, 0);
        return dataVenda.getTime() === hoje.getTime();
      })
      .reduce((total, venda) => total + venda.valorTotal, 0);
  }

  getVendasPorStatus(status: StatusVenda): Venda[] {
    return this.vendas().filter(v => v.status === status);
  }

  getVendasComRecebimentoPendente(): Venda[] {
    return this.vendas().filter(v => v.recebimentoPendente);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}