import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendaService } from '../../services/venda.service';
import { ClienteService } from '../../services/cliente.service';
import { EnderecoService } from '../../services/endereco.service';
import { EntregadorService } from '../../services/entregador.service';
import { ProdutoService } from '../../services/produto.service';
import { Venda, VendaFormData, StatusVenda, FormaPagamento, ItemVenda, PagamentoVenda } from '../../models/venda.model';
import { Cliente } from '../../models/cliente.model';
import { Endereco } from '../../models/endereco.model';
import { Entregador } from '../../models/entregador.model';
import { Produto } from '../../models/produto.model';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;
type CreateStep = 1 | 2 | 3;

@Component({
  selector: 'app-vendas',
  imports: [CommonModule, FormsModule],
  templateUrl: './vendas.html',
  styleUrl: './vendas.css',
})
export class Vendas {
  private vendaService = inject(VendaService);
  private clienteService = inject(ClienteService);
  private enderecoService = inject(EnderecoService);
  private entregadorService = inject(EntregadorService);
  private produtoService = inject(ProdutoService);

  // Paginação
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Modal
  modalType = signal<ModalType>(null);
  selectedVenda = signal<Venda | null>(null);

  // Etapas do cadastro
  createStep = signal<CreateStep>(1);

  // Dados temporários durante o cadastro - MÚLTIPLOS PAGAMENTOS
  tempItens = signal<ItemVenda[]>([]);
  tempClienteId = signal<string>('');
  tempEnderecoId = signal<string>('');
  tempPagamentos = signal<PagamentoVenda[]>([]);
  tempFormaPagamento = signal<FormaPagamento>('dinheiro');
  tempValorPagamento = signal<number>(0);
  tempValorTotal = signal<number>(0);
  tempObservacoes = signal<string>('');

  // Produto sendo adicionado (step 1)
  produtoSelecionadoId = signal<string>('');
  quantidadeProduto = signal<number>(1);

  // Busca de clientes nos modais
  clienteSearchTerm = signal<string>('');

  // Formulário de edição
  formData = signal<VendaFormData>({
    clienteId: '',
    enderecoId: '',
    entregadorId: '',
    itens: [],
    pagamentos: [],
    valorTotal: 0,
    observacoes: ''
  });

  // Busca e filtros
  searchTerm = signal('');
  filterEntregador = signal<string>('');
  filterStatus = signal<StatusVenda | ''>('');
  filterDataInicio = signal<string>(this.getDataAtualFormatada());
  filterDataFim = signal<string>(this.getDataAtualFormatada());

  // Computed
  vendas = this.vendaService.getVendas();
  clientes = this.clienteService.getClientes();
  entregadores = this.entregadorService.getEntregadores();
  produtos = this.produtoService.getProdutos();
  
  // Clientes filtrados pela busca
  clientesFiltrados = computed(() => {
    const search = this.clienteSearchTerm().toLowerCase().trim();
    if (!search) return this.clientes();
    
    return this.clientes().filter(c => 
      c.nome.toLowerCase().includes(search) ||
      c.telefone.includes(search)
    );
  });

  // Endereços do cliente selecionado
  enderecosDoCliente = computed(() => {
    const clienteId = this.modalType() === 'create' 
      ? this.tempClienteId() 
      : this.formData().clienteId;
    
    if (!clienteId) return [];
    
    const cliente = this.clienteService.getClienteById(clienteId);
    if (!cliente) return [];
    
    return this.enderecoService.getEnderecosByIds(cliente.enderecosIds);
  });

  // Entregadores ativos
  entregadoresAtivos = computed(() => 
    this.entregadores().filter(e => e.ativo)
  );

  // Total dos pagamentos temporários
  totalPagamentosTemp = computed(() => {
    return this.tempPagamentos().reduce((sum, p) => sum + p.valor, 0);
  });

  // Vendas filtradas
  filteredVendas = computed(() => {
    let list = this.vendas();
    
    // Filtro de busca (nome, endereço ou telefone do cliente)
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      list = list.filter(v => 
        v.clienteNome.toLowerCase().includes(search) ||
        v.enderecoFormatado.toLowerCase().includes(search) ||
        v.clienteTelefone.includes(search)
      );
    }
    
    // Filtro por entregador
    if (this.filterEntregador()) {
      list = list.filter(v => v.entregadorId === this.filterEntregador());
    }
    
    // Filtro por status
    if (this.filterStatus()) {
      list = list.filter(v => v.status === this.filterStatus());
    }
    
    // Filtro por data
    const dataInicio = this.filterDataInicio() ? new Date(this.filterDataInicio()) : null;
    const dataFim = this.filterDataFim() ? new Date(this.filterDataFim()) : null;
    
    if (dataInicio) {
      dataInicio.setHours(0, 0, 0, 0);
      list = list.filter(v => {
        const dataVenda = new Date(v.dataVenda);
        dataVenda.setHours(0, 0, 0, 0);
        return dataVenda >= dataInicio;
      });
    }
    
    if (dataFim) {
      dataFim.setHours(23, 59, 59, 999);
      list = list.filter(v => {
        const dataVenda = new Date(v.dataVenda);
        return dataVenda <= dataFim;
      });
    }
    
    // Ordena por data (mais recentes primeiro)
    return list.sort((a, b) => 
      new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime()
    );
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredVendas().length / this.itemsPerPage())
  );

  paginatedVendas = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredVendas().slice(start, end);
  });

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Totalizadores
  totalVendas = computed(() => {
    return this.filteredVendas().reduce((sum, v) => sum + v.valorTotal, 0);
  });

  totalPorEntregador = computed(() => {
    const totais = new Map<string, { nome: string, total: number }>();
    
    this.filteredVendas().forEach(v => {
      // Soma apenas pagamentos que não sejam PIX
      const valorParaEntregador = v.pagamentos
        .filter(p => p.forma !== 'pix')
        .reduce((sum, p) => sum + p.valor, 0);
      
      if (valorParaEntregador > 0) {
        const key = v.entregadorId;
        const current = totais.get(key) || { 
          nome: v.entregadorIdentificador, 
          total: 0 
        };
        totais.set(key, {
          ...current,
          total: current.total + valorParaEntregador
        });
      }
    });
    
    return Array.from(totais.values())
      .sort((a, b) => b.total - a.total);
  });

  // Produto selecionado atual
  produtoSelecionado = computed(() => {
    const id = this.produtoSelecionadoId();
    return id ? this.produtos().find(p => p.id === id) : null;
  });

  // Preço do produto baseado na forma de pagamento temporária
  precoProdutoAtual = computed(() => {
    const produto = this.produtoSelecionado();
    const formaPagamento = this.tempFormaPagamento();
    return produto ? produto.precos[formaPagamento] : 0;
  });

  // Total calculado dos itens temporários
  totalItensTemp = computed(() => {
    return this.tempItens().reduce((sum, item) => sum + item.subtotal, 0);
  });

  // ===== NAVEGAÇÃO =====

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  // ===== BUSCA E FILTROS =====

  updateSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  updateClienteSearchTerm(event: Event) {
    const input = event.target as HTMLInputElement;
    this.clienteSearchTerm.set(input.value);
  }

  clearClienteSearch() {
    this.clienteSearchTerm.set('');
  }

  updateFilterEntregador(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterEntregador.set(select.value);
    this.currentPage.set(1);
  }

  updateFilterStatus(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value as StatusVenda | '');
    this.currentPage.set(1);
  }

  updateFilterDataInicio(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterDataInicio.set(input.value);
    this.currentPage.set(1);
  }

  updateFilterDataFim(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterDataFim.set(input.value);
    this.currentPage.set(1);
  }

  limparFiltros() {
    this.searchTerm.set('');
    this.filterEntregador.set('');
    this.filterStatus.set('');
    this.filterDataInicio.set(this.getDataAtualFormatada());
    this.filterDataFim.set(this.getDataAtualFormatada());
    this.currentPage.set(1);
  }

  // ===== MODAL - CRIAR VENDA =====

  openCreateModal() {
    this.resetCreateForm();
    this.modalType.set('create');
    this.createStep.set(1);
  }

  resetCreateForm() {
    this.tempItens.set([]);
    this.tempClienteId.set('');
    this.tempEnderecoId.set('');
    this.tempPagamentos.set([]);
    this.tempFormaPagamento.set('dinheiro');
    this.tempValorPagamento.set(0);
    this.tempValorTotal.set(0);
    this.tempObservacoes.set('');
    this.produtoSelecionadoId.set('');
    this.quantidadeProduto.set(1);
    this.clienteSearchTerm.set('');
  }

  // ===== PAGAMENTOS MÚLTIPLOS =====

  updateFormaPagamento(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.tempFormaPagamento.set(select.value as FormaPagamento);
    this.recalcularItens();
  }

  updateValorPagamento(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.tempValorPagamento.set(value >= 0 ? value : 0);
  }

  adicionarPagamento() {
    const forma = this.tempFormaPagamento();
    const valor = this.tempValorPagamento();
    
    if (valor <= 0) return;
    
    const novoPagamento: PagamentoVenda = { forma, valor };
    this.tempPagamentos.update(pagamentos => [...pagamentos, novoPagamento]);
    
    // Atualiza valor total
    this.tempValorTotal.set(this.totalPagamentosTemp());
    
    // Reset
    this.tempValorPagamento.set(0);
  }

  removerPagamento(index: number) {
    this.tempPagamentos.update(pagamentos => pagamentos.filter((_, i) => i !== index));
    this.tempValorTotal.set(this.totalPagamentosTemp());
  }

  // Step 1: Selecionar produtos
  updateProdutoSelecionado(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.produtoSelecionadoId.set(select.value);
  }

  updateQuantidadeProduto(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    this.quantidadeProduto.set(value > 0 ? value : 1);
  }

  recalcularItens() {
    const formaPagamento = this.tempFormaPagamento();
    this.tempItens.update(itens => 
      itens.map(item => {
        const produto = this.produtos().find(p => p.id === item.produtoId);
        if (produto) {
          const precoUnitario = produto.precos[formaPagamento];
          return {
            ...item,
            precoUnitario,
            subtotal: precoUnitario * item.quantidade
          };
        }
        return item;
      })
    );
  }

  adicionarProduto() {
    const produtoId = this.produtoSelecionadoId();
    const produto = this.produtoSelecionado();
    const quantidade = this.quantidadeProduto();
    const precoUnitario = this.precoProdutoAtual();

    if (!produto || quantidade <= 0) return;

    const novoItem: ItemVenda = {
      produtoId,
      produtoNome: produto.nome,
      quantidade,
      precoUnitario,
      subtotal: precoUnitario * quantidade
    };

    this.tempItens.update(itens => [...itens, novoItem]);
    
    // Atualiza valor total automaticamente
    this.tempValorTotal.set(this.totalItensTemp());
    
    // Reset
    this.produtoSelecionadoId.set('');
    this.quantidadeProduto.set(1);
  }

  removerItem(index: number) {
    this.tempItens.update(itens => itens.filter((_, i) => i !== index));
    
    // Atualiza valor total automaticamente
    this.tempValorTotal.set(this.totalItensTemp());
  }

  updateValorTotal(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.tempValorTotal.set(value >= 0 ? value : 0);
  }

  proximoStep() {
    if (this.createStep() === 1 && this.tempItens().length > 0) {
      this.createStep.set(2);
    } else if (this.createStep() === 2 && this.tempClienteId() && this.tempEnderecoId()) {
      this.createStep.set(3);
    }
  }

  voltarStep() {
    if (this.createStep() > 1) {
      this.createStep.update(s => (s - 1) as CreateStep);
    }
  }

  // Step 2: Selecionar cliente e endereço
  updateTempCliente(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.tempClienteId.set(select.value);
    this.tempEnderecoId.set(''); // Reseta endereço ao mudar cliente
  }

  updateTempEndereco(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.tempEnderecoId.set(select.value);
  }

  // Step 3: Selecionar entregador e confirmar
  confirmarCadastro(entregadorId: string) {
    if (!entregadorId || this.tempItens().length === 0 || !this.tempClienteId() || !this.tempEnderecoId()) {
      return;
    }

    // Se não houver pagamentos, criar um pagamento com o valor total na forma padrão
    let pagamentosFinal = [...this.tempPagamentos()];
    const valorTotal = this.totalItensTemp();
    
    if (pagamentosFinal.length === 0) {
      // Nenhum pagamento especificado - usa a forma padrão com valor total
      pagamentosFinal = [{
        forma: this.tempFormaPagamento(),
        valor: valorTotal
      }];
    } else {
      // Tem pagamentos parciais - calcular se falta algo
      const totalPagamentos = pagamentosFinal.reduce((sum, p) => sum + p.valor, 0);
      const diferenca = valorTotal - totalPagamentos;
      
      // Se a soma dos pagamentos for menor que o total, adicionar a diferença na forma padrão
      if (diferenca > 0.01) {
        pagamentosFinal.push({
          forma: this.tempFormaPagamento(),
          valor: diferenca
        });
      }
    }

    const vendaData: VendaFormData = {
      clienteId: this.tempClienteId(),
      enderecoId: this.tempEnderecoId(),
      entregadorId,
      itens: this.tempItens(),
      pagamentos: pagamentosFinal,
      valorTotal: valorTotal,
      observacoes: this.tempObservacoes()
    };

    this.vendaService.createVenda(vendaData);
    this.closeModal();
  }

  updateTempObservacoes(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.tempObservacoes.set(textarea.value);
  }

  // ===== MODAL - VISUALIZAR =====

  openViewModal(venda: Venda) {
    this.selectedVenda.set(venda);
    this.modalType.set('view');
  }

  // Alterar status no modal de visualização
  updateStatusView(event: Event) {
    const select = event.target as HTMLSelectElement;
    const venda = this.selectedVenda();
    if (venda) {
      this.vendaService.updateStatus(venda.id, select.value as StatusVenda);
    }
  }

  // ===== MODAL - EDITAR =====

  openEditModal(venda: Venda) {
    this.selectedVenda.set(venda);
    this.formData.set({
      clienteId: venda.clienteId,
      enderecoId: venda.enderecoId,
      entregadorId: venda.entregadorId,
      itens: [...venda.itens],
      pagamentos: [...venda.pagamentos],
      valorTotal: venda.valorTotal,
      observacoes: venda.observacoes
    });
    this.clienteSearchTerm.set('');
    this.modalType.set('edit');
  }

  updateFormCliente(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.formData.update(f => ({ ...f, clienteId: select.value, enderecoId: '' }));
  }

  updateFormEndereco(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.formData.update(f => ({ ...f, enderecoId: select.value }));
  }

  updateFormEntregador(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.formData.update(f => ({ ...f, entregadorId: select.value }));
  }

  updateFormValorTotal(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    this.formData.update(f => ({ ...f, valorTotal: value >= 0 ? value : 0 }));
  }

  updateFormObservacoes(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.formData.update(f => ({ ...f, observacoes: textarea.value }));
  }

  confirmarEdicao() {
    const venda = this.selectedVenda();
    if (!venda) return;

    this.vendaService.updateVenda(venda.id, this.formData());
    this.closeModal();
  }

  // ===== MODAL - EXCLUIR =====

  openDeleteModal(venda: Venda) {
    this.selectedVenda.set(venda);
    this.modalType.set('delete');
  }

  confirmarExclusao() {
    const venda = this.selectedVenda();
    if (!venda) return;

    this.vendaService.deleteVenda(venda.id);
    this.closeModal();
  }

  // ===== AÇÕES NA LISTA =====

  updateStatus(vendaId: string, novoStatus: StatusVenda) {
    this.vendaService.updateStatus(vendaId, novoStatus);
  }

  marcarRecebimentoPendente(vendaId: string) {
    this.vendaService.toggleRecebimentoPendente(vendaId);
  }

  // ===== FECHAR MODAL =====

  closeModal() {
    this.modalType.set(null);
    this.selectedVenda.set(null);
    this.resetCreateForm();
  }

  closeModalBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  // ===== HELPERS =====

  getStatusLabel(status: StatusVenda): string {
    const labels: Record<StatusVenda, string> = {
      'a-entregar': 'A Entregar',
      'entregando': 'Entregando',
      'entregue': 'Entregue'
    };
    return labels[status];
  }

  getStatusClass(status: StatusVenda): string {
    const classes: Record<StatusVenda, string> = {
      'a-entregar': 'status-pendente',
      'entregando': 'status-progresso',
      'entregue': 'status-sucesso'
    };
    return classes[status];
  }

  getFormaPagamentoLabel(forma: FormaPagamento): string {
    const labels: Record<FormaPagamento, string> = {
      'credito': 'Crédito',
      'debito': 'Débito',
      'dinheiro': 'Dinheiro',
      'pix': 'PIX'
    };
    return labels[forma];
  }

  getWhatsAppLink(telefone: string): string {
    const numero = telefone.replace(/\D/g, '');
    return `https://wa.me/55${numero}`;
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  }

  getEnderecoFormatado(endereco: Endereco): string {
    return this.enderecoService.getEnderecoFormatado(endereco);
  }

  private getDataAtualFormatada(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}