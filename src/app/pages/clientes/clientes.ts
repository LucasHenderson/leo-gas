import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { EnderecoService } from '../../services/endereco.service';
import { Cliente, ClienteFormData, HistoricoCompra } from '../../models/cliente.model';
import { Endereco } from '../../models/endereco.model';

type ModalType = 'create' | 'edit' | 'delete' | 'view' | null;
type SortOrder = 'nome-asc' | 'nome-desc' | 'recentes' | 'antigos' | 'sem-compras' | 'nenhum';

@Component({
  selector: 'app-clientes',
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  private clienteService = inject(ClienteService);
  private enderecoService = inject(EnderecoService);

  // Paginação
  currentPage = signal(1);
  itemsPerPage = signal(8);
  
  // Modal
  modalType = signal<ModalType>(null);
  selectedCliente = signal<Cliente | null>(null);
  
  // Formulário
  formData = signal<ClienteFormData>({
    nome: '',
    telefone: '',
    enderecosIds: [],
    dataCadastro: new Date(),
    observacoes: ''
  });

  // Busca e ordenação
  searchTerm = signal('');
  sortOrder = signal<SortOrder>('nenhum');

  // Texto copiado feedback
  textoCopiadoFeedback = signal(false);

  // Para modal de cadastro - texto gerado
  textoGerado = signal('');

  // Computed
  clientes = this.clienteService.getClientes();
  enderecos = this.enderecoService.getEnderecos();
  totalClientes = computed(() => this.clienteService.getTotalClientes());

  filteredClientes = computed(() => {
    let list = this.clientes();
    
    // Busca por nome ou telefone
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      list = list.filter(c => 
        c.nome.toLowerCase().includes(search) ||
        c.telefone.includes(search)
      );
    }
    
    // Ordenação
    const order = this.sortOrder();
    switch (order) {
      case 'nome-asc':
        list = [...list].sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome-desc':
        list = [...list].sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'recentes':
        list = [...list].sort((a, b) => 
          new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()
        );
        break;
      case 'antigos':
        list = [...list].sort((a, b) => 
          new Date(a.dataCadastro).getTime() - new Date(b.dataCadastro).getTime()
        );
        break;
      case 'sem-compras':
        list = this.clienteService.getClientesSemComprasRecentes()
          .filter(c => list.some(l => l.id === c.id));
        break;
    }
    
    return list;
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredClientes().length / this.itemsPerPage())
  );

  paginatedClientes = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredClientes().slice(start, end);
  });

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // ===== AÇÕES DE MODAL =====
  
  openCreateModal() {
    this.resetForm();
    this.textoGerado.set('');
    this.modalType.set('create');
  }

  openEditModal(cliente: Cliente, event: Event) {
    event.stopPropagation();
    this.selectedCliente.set(cliente);
    this.formData.set({
      nome: cliente.nome,
      telefone: cliente.telefone,
      enderecosIds: [...cliente.enderecosIds],
      dataCadastro: cliente.dataCadastro,
      observacoes: cliente.observacoes
    });
    this.modalType.set('edit');
  }

  openDeleteModal(cliente: Cliente, event: Event) {
    event.stopPropagation();
    this.selectedCliente.set(cliente);
    this.modalType.set('delete');
  }

  openViewModal(cliente: Cliente) {
    this.selectedCliente.set(cliente);
    this.modalType.set('view');
  }

  closeModal() {
    this.modalType.set(null);
    this.selectedCliente.set(null);
    this.textoGerado.set('');
    this.resetForm();
  }

  // ===== ATUALIZAÇÃO DE CAMPOS =====

  updateNome(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, nome: input.value }));
  }

  updateTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Formata o telefone
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    this.formData.update(data => ({ ...data, telefone: value }));
  }

  updateObservacoes(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.formData.update(data => ({ ...data, observacoes: textarea.value }));
  }

  updateDataCadastro(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, dataCadastro: new Date(input.value) }));
  }

  toggleEndereco(enderecoId: string) {
    this.formData.update(data => {
      const enderecosIds = data.enderecosIds.includes(enderecoId)
        ? data.enderecosIds.filter(id => id !== enderecoId)
        : [...data.enderecosIds, enderecoId];
      return { ...data, enderecosIds };
    });
  }

  // ===== AÇÕES CRUD =====

  handleSubmit() {
    const data = this.formData();
    const isEdit = this.modalType() === 'edit';
    
    if (isEdit) {
      const clienteId = this.selectedCliente()!.id;
      const oldEnderecos = this.selectedCliente()!.enderecosIds;
      
      // Atualiza cliente
      this.clienteService.updateCliente(clienteId, data);
      
      // Atualiza vínculos nos endereços
      // Remove dos antigos
      oldEnderecos.forEach(endId => {
        if (!data.enderecosIds.includes(endId)) {
          this.enderecoService.desvincularCliente(endId, clienteId);
        }
      });
      // Adiciona nos novos
      data.enderecosIds.forEach(endId => {
        if (!oldEnderecos.includes(endId)) {
          this.enderecoService.vincularCliente(endId, clienteId);
        }
      });
      
      this.closeModal();
    } else {
      // Cria novo cliente
      const novoCliente = this.clienteService.createCliente(data);
      
      // Vincula aos endereços selecionados
      data.enderecosIds.forEach(endId => {
        this.enderecoService.vincularCliente(endId, novoCliente.id);
      });
      
      // Gera texto de cadastro
      const enderecosFormatados = this.getEnderecosFormatados(data.enderecosIds);
      const texto = this.clienteService.gerarTextoCadastro(novoCliente, enderecosFormatados);
      this.textoGerado.set(texto);
    }
  }

  confirmDelete() {
    const cliente = this.selectedCliente();
    if (cliente) {
      // Remove vínculos dos endereços
      this.enderecoService.removerClienteDeTodosEnderecos(cliente.id);
      
      // Exclui cliente
      this.clienteService.deleteCliente(cliente.id);
      
      this.closeModal();
    }
  }

  // ===== HELPERS =====

  getEnderecosDoCliente(enderecosIds: string[]): Endereco[] {
    return this.enderecoService.getEnderecosByIds(enderecosIds);
  }

  getEnderecoFormatado(endereco: Endereco): string {
    return this.enderecoService.getEnderecoFormatado(endereco);
  }

  getEnderecosFormatados(enderecosIds: string[]): string[] {
    return enderecosIds.map(id => {
      const endereco = this.enderecoService.getEnderecoById(id);
      return endereco ? this.getEnderecoFormatado(endereco) : '';
    }).filter(e => e !== '');
  }

  getHistoricoCliente(): HistoricoCompra[] {
    const cliente = this.selectedCliente();
    if (!cliente) return [];
    return this.clienteService.getHistoricoCompras(cliente.id);
  }

  getUltimaCompra(clienteId: string): HistoricoCompra | undefined {
    return this.clienteService.getUltimaCompra(clienteId);
  }

  getWhatsAppLink(telefone: string): string {
    return this.clienteService.getWhatsAppLink(telefone);
  }

  getClientesVinculadosAoEndereco(enderecoId: string): Cliente[] {
    const endereco = this.enderecoService.getEnderecoById(enderecoId);
    if (!endereco) return [];
    return this.clienteService.getClientesByIds(endereco.clientesIds);
  }

  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto).then(() => {
      this.textoCopiadoFeedback.set(true);
      setTimeout(() => this.textoCopiadoFeedback.set(false), 2000);
    });
  }

  copiarResumoCliente() {
    const cliente = this.selectedCliente();
    if (!cliente) return;
    
    const enderecos = this.getEnderecosFormatados(cliente.enderecosIds);
    const historico = this.getHistoricoCliente();
    const texto = this.clienteService.gerarTextoResumo(cliente, enderecos, historico);
    
    this.copiarTexto(texto);
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  getDateInputValue(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ===== PAGINAÇÃO =====

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

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  changeSortOrder(order: SortOrder) {
    this.sortOrder.set(order);
    this.currentPage.set(1);
  }

  private resetForm() {
    this.formData.set({
      nome: '',
      telefone: '',
      enderecosIds: [],
      dataCadastro: new Date(),
      observacoes: ''
    });
  }
}