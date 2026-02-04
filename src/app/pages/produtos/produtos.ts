import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../services/produto.service';
import { VariavelEstoqueService } from '../../services/variavel-estoque.service';
import { Produto, ProdutoFormData, PrecoPorPagamento, VinculoEstoque, TipoInteracaoEstoque } from '../../models/produto.model';
import { VariavelEstoque, VariavelEstoqueFormData } from '../../models/variavel-estoque.model';

type ModalType = 'create' | 'edit' | 'delete' | 'create-variavel' | 'edit-variavel' | 'delete-variavel' | null;
type SortOrder = 'maior-vendas' | 'menor-vendas' | 'nenhum';

@Component({
  selector: 'app-produtos',
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.css',
})
export class Produtos {
  private produtoService = inject(ProdutoService);
  private variavelEstoqueService = inject(VariavelEstoqueService);

  // Paginação
  currentPage = signal(1);
  itemsPerPage = signal(6);
  
  // Modal
  modalType = signal<ModalType>(null);
  selectedProduto = signal<Produto | null>(null);
  selectedVariavel = signal<VariavelEstoque | null>(null);
  
  // Formulário de Produto
  formData = signal<ProdutoFormData>({
    nome: '',
    precos: {
      credito: 0,
      debito: 0,
      dinheiro: 0,
      pix: 0
    },
    vinculos: []
  });
  
  formErrors = signal({
    nome: '',
    credito: '',
    debito: '',
    dinheiro: '',
    pix: '',
    vinculos: ''
  });

  // Formulário de Variável de Estoque
  variavelFormData = signal<VariavelEstoqueFormData>({
    nome: '',
    quantidade: 0
  });

  variavelFormErrors = signal({
    nome: '',
    quantidade: ''
  });

  // Busca e ordenação
  searchTerm = signal('');
  sortOrder = signal<SortOrder>('nenhum');

  // Filtro de período para vendas
  dataInicio = signal<Date | null>(null);
  dataFim = signal<Date | null>(null);

  // Seção de variáveis expandida
  variaveisExpanded = signal(false);

  // Computed
  produtos = this.produtoService.getProdutos();
  variaveis = this.variavelEstoqueService.getVariaveis();

  // Cache de vendas por período
  vendasPorPeriodo = computed(() => {
    return this.produtoService.getTodosVendasPorPeriodo(this.dataInicio(), this.dataFim());
  });
  
  filteredProdutos = computed(() => {
    let list = this.produtos();
    const vendasMap = this.vendasPorPeriodo();
    
    // Busca por nome
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      list = list.filter(p => 
        p.nome.toLowerCase().includes(search)
      );
    }
    
    // Ordenação por vendas
    const order = this.sortOrder();
    if (order === 'maior-vendas') {
      list = [...list].sort((a, b) => 
        (vendasMap.get(b.id) || 0) - (vendasMap.get(a.id) || 0)
      );
    } else if (order === 'menor-vendas') {
      list = [...list].sort((a, b) => 
        (vendasMap.get(a.id) || 0) - (vendasMap.get(b.id) || 0)
      );
    }
    
    return list;
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredProdutos().length / this.itemsPerPage())
  );

  paginatedProdutos = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredProdutos().slice(start, end);
  });

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // ===== AÇÕES DE MODAL - PRODUTOS =====
  
  openCreateModal() {
    this.resetForm();
    this.modalType.set('create');
  }

  openEditModal(produto: Produto) {
    this.selectedProduto.set(produto);
    this.formData.set({
      nome: produto.nome,
      precos: { ...produto.precos },
      vinculos: produto.vinculos.map(v => ({ ...v }))
    });
    this.modalType.set('edit');
  }

  openDeleteModal(produto: Produto) {
    this.selectedProduto.set(produto);
    this.modalType.set('delete');
  }

  // ===== AÇÕES DE MODAL - VARIÁVEIS =====

  openCreateVariavelModal() {
    this.resetVariavelForm();
    this.modalType.set('create-variavel');
  }

  openEditVariavelModal(variavel: VariavelEstoque) {
    this.selectedVariavel.set(variavel);
    this.variavelFormData.set({
      nome: variavel.nome,
      quantidade: variavel.quantidade
    });
    this.modalType.set('edit-variavel');
  }

  openDeleteVariavelModal(variavel: VariavelEstoque) {
    this.selectedVariavel.set(variavel);
    this.modalType.set('delete-variavel');
  }

  closeModal() {
    this.modalType.set(null);
    this.selectedProduto.set(null);
    this.selectedVariavel.set(null);
    this.resetForm();
    this.resetVariavelForm();
  }

  // ===== VALIDAÇÃO - PRODUTOS =====

  validateForm(): boolean {
    const errors = {
      nome: '',
      credito: '',
      debito: '',
      dinheiro: '',
      pix: '',
      vinculos: ''
    };

    const data = this.formData();

    if (!data.nome.trim()) {
      errors.nome = 'Nome do produto é obrigatório';
    } else if (data.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!data.precos.credito || data.precos.credito <= 0) {
      errors.credito = 'Preço no crédito é obrigatório';
    }

    if (!data.precos.debito || data.precos.debito <= 0) {
      errors.debito = 'Preço no débito é obrigatório';
    }

    if (!data.precos.dinheiro || data.precos.dinheiro <= 0) {
      errors.dinheiro = 'Preço em dinheiro é obrigatório';
    }

    if (!data.precos.pix || data.precos.pix <= 0) {
      errors.pix = 'Preço no PIX é obrigatório';
    }

    if (data.vinculos.length === 0) {
      errors.vinculos = 'Produto deve ter pelo menos 1 vínculo de estoque';
    }

    this.formErrors.set(errors);
    return !errors.nome && !errors.credito && !errors.debito && !errors.dinheiro && !errors.pix && !errors.vinculos;
  }

  // ===== VALIDAÇÃO - VARIÁVEIS =====

  validateVariavelForm(): boolean {
    const errors = {
      nome: '',
      quantidade: ''
    };

    const data = this.variavelFormData();

    if (!data.nome.trim()) {
      errors.nome = 'Nome da variável é obrigatório';
    } else if (data.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (data.quantidade < 0) {
      errors.quantidade = 'Quantidade não pode ser negativa';
    }

    this.variavelFormErrors.set(errors);
    return !errors.nome && !errors.quantidade;
  }

  // ===== ATUALIZAÇÃO DE CAMPOS - PRODUTOS =====

  updateNome(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, nome: input.value }));
  }

  updatePrecoCredito(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.formData.update(data => ({ 
      ...data, 
      precos: { ...data.precos, credito: value }
    }));
  }

  updatePrecoDebito(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.formData.update(data => ({ 
      ...data, 
      precos: { ...data.precos, debito: value }
    }));
  }

  updatePrecoDinheiro(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.formData.update(data => ({ 
      ...data, 
      precos: { ...data.precos, dinheiro: value }
    }));
  }

  updatePrecoPix(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.formData.update(data => ({ 
      ...data, 
      precos: { ...data.precos, pix: value }
    }));
  }

  // ===== ATUALIZAÇÃO DE CAMPOS - VARIÁVEIS =====

  updateVariavelNome(event: Event) {
    const input = event.target as HTMLInputElement;
    this.variavelFormData.update(data => ({ ...data, nome: input.value }));
  }

  updateVariavelQuantidade(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value) || 0;
    this.variavelFormData.update(data => ({ ...data, quantidade: value }));
  }

  // ===== GERENCIAMENTO DE VÍNCULOS =====

  addVinculo() {
    const variaveis = this.variaveis();
    if (variaveis.length === 0) return;

    // Encontra uma variável que ainda não está vinculada
    const vinculosAtuais = this.formData().vinculos;
    const variavelDisponivel = variaveis.find(v => 
      !vinculosAtuais.some(vinculo => vinculo.variavelEstoqueId === v.id)
    );

    if (variavelDisponivel) {
      this.formData.update(data => ({
        ...data,
        vinculos: [...data.vinculos, { 
          variavelEstoqueId: variavelDisponivel.id, 
          tipoInteracao: 'reduz' 
        }]
      }));
    }
  }

  removeVinculo(index: number) {
    this.formData.update(data => ({
      ...data,
      vinculos: data.vinculos.filter((_, i) => i !== index)
    }));
  }

  updateVinculoVariavel(index: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.formData.update(data => {
      const vinculos = [...data.vinculos];
      vinculos[index] = { ...vinculos[index], variavelEstoqueId: select.value };
      return { ...data, vinculos };
    });
  }

  updateVinculoTipo(index: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.formData.update(data => {
      const vinculos = [...data.vinculos];
      vinculos[index] = { ...vinculos[index], tipoInteracao: select.value as TipoInteracaoEstoque };
      return { ...data, vinculos };
    });
  }

  getVariavelNome(variavelId: string): string {
    const variavel = this.variaveis().find(v => v.id === variavelId);
    return variavel?.nome || 'Desconhecido';
  }

  getVinculosDisponiveis(currentVinculoId?: string): VariavelEstoque[] {
    const vinculosAtuais = this.formData().vinculos;
    return this.variaveis().filter(v => 
      v.id === currentVinculoId || 
      !vinculosAtuais.some(vinculo => vinculo.variavelEstoqueId === v.id)
    );
  }

  // ===== AÇÕES CRUD - PRODUTOS =====

  handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const data = this.formData();
    const isEdit = this.modalType() === 'edit';
    
    if (isEdit) {
      this.produtoService.updateProduto(this.selectedProduto()!.id, data);
    } else {
      this.produtoService.createProduto(data);
    }

    this.closeModal();
  }

  confirmDelete() {
    const produto = this.selectedProduto();
    if (produto) {
      this.produtoService.deleteProduto(produto.id);
      this.closeModal();
    }
  }

  // ===== AÇÕES CRUD - VARIÁVEIS =====

  handleVariavelSubmit() {
    if (!this.validateVariavelForm()) {
      return;
    }

    const data = this.variavelFormData();
    const isEdit = this.modalType() === 'edit-variavel';
    
    let success: boolean;
    if (isEdit) {
      success = this.variavelEstoqueService.updateVariavel(this.selectedVariavel()!.id, data);
    } else {
      success = this.variavelEstoqueService.createVariavel(data);
    }

    if (!success) {
      this.variavelFormErrors.update(errors => ({
        ...errors,
        nome: 'Já existe uma variável com este nome'
      }));
      return;
    }

    this.closeModal();
  }

  confirmDeleteVariavel() {
    const variavel = this.selectedVariavel();
    if (variavel) {
      // Verifica se há produtos vinculados
      const produtosVinculados = this.produtos().filter(p => 
        p.vinculos.some(v => v.variavelEstoqueId === variavel.id)
      );

      if (produtosVinculados.length > 0) {
        alert(`Não é possível excluir. Existem ${produtosVinculados.length} produto(s) vinculado(s) a esta variável.`);
        return;
      }

      this.variavelEstoqueService.deleteVariavel(variavel.id);
      this.closeModal();
    }
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

  // ===== FILTRO DE PERÍODO =====

  updateDataInicio(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dataInicio.set(input.value ? new Date(input.value) : null);
    this.currentPage.set(1);
  }

  updateDataFim(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dataFim.set(input.value ? new Date(input.value) : null);
    this.currentPage.set(1);
  }

  clearDateFilter() {
    this.dataInicio.set(null);
    this.dataFim.set(null);
    this.currentPage.set(1);
  }

  getDateInputValue(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ===== HELPERS =====

  getTotalVendas(produtoId: string): number {
    return this.vendasPorPeriodo().get(produtoId) || 0;
  }

  getVendasStatus(totalVendas: number): 'alto' | 'medio' | 'baixo' {
    if (totalVendas >= 30) return 'alto';
    if (totalVendas >= 10) return 'medio';
    return 'baixo';
  }

  getMelhorPreco(precos: PrecoPorPagamento): number {
    return Math.min(precos.credito, precos.debito, precos.dinheiro, precos.pix);
  }

  toggleVariaveis() {
    this.variaveisExpanded.update(v => !v);
  }

  getEstoqueStatus(quantidade: number): 'critico' | 'baixo' | 'normal' {
    if (quantidade <= 5) return 'critico';
    if (quantidade <= 15) return 'baixo';
    return 'normal';
  }

  private resetForm() {
    this.formData.set({
      nome: '',
      precos: {
        credito: 0,
        debito: 0,
        dinheiro: 0,
        pix: 0
      },
      vinculos: []
    });
    this.formErrors.set({
      nome: '',
      credito: '',
      debito: '',
      dinheiro: '',
      pix: '',
      vinculos: ''
    });
  }

  private resetVariavelForm() {
    this.variavelFormData.set({
      nome: '',
      quantidade: 0
    });
    this.variavelFormErrors.set({
      nome: '',
      quantidade: ''
    });
  }
}