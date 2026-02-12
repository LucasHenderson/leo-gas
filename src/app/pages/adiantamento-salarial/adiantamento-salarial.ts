import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntregadorService } from '../../services/entregador.service';
import { AdiantamentoService } from '../../services/adiantamento.service';
import { Entregador } from '../../models/entregador.model';
import { Adiantamento, AdiantamentoFormData } from '../../models/adiantamento.model';

type ModalType = 'create' | 'edit' | 'delete' | null;
type SortOrder = 'nome-asc' | 'nome-desc' | 'identificador-asc' | 'mais-gastos' | 'menos-gastos' | 'nenhum';

@Component({
  selector: 'app-adiantamento-salarial',
  imports: [CommonModule, FormsModule],
  templateUrl: './adiantamento-salarial.html',
  styleUrl: './adiantamento-salarial.css',
})
export class AdiantamentoSalarial {
  private entregadorService = inject(EntregadorService);
  private adiantamentoService = inject(AdiantamentoService);

  // Filtros globais
  searchTerm = signal('');
  showInactive = signal(false);
  sortOrder = signal<SortOrder>('nenhum');
  dataInicio = signal('');
  dataFim = signal('');

  // Modal
  modalType = signal<ModalType>(null);
  selectedEntregadorId = signal<string>('');
  selectedAdiantamento = signal<Adiantamento | null>(null);

  // Formulário
  formData = signal<AdiantamentoFormData>({
    descricao: '',
    data: new Date(),
    valor: 0,
  });

  formErrors = signal({
    descricao: '',
    data: '',
    valor: '',
  });

  // Paginação por entregador (Map: entregadorId -> currentPage)
  currentPages = signal<Record<string, number>>({});

  itemsPerPage = 10;

  // Dados
  entregadores = this.entregadorService.getEntregadores();
  adiantamentos = this.adiantamentoService.getAdiantamentos();

  constructor() {
    // Inicializar datas com o mês atual
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    this.dataInicio.set(`${year}-${month}-01`);
    this.dataFim.set(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
  }

  // Computed: entregadores filtrados
  filteredEntregadores = computed(() => {
    let list = this.entregadores();

    // Filtro de ativos/inativos
    if (!this.showInactive()) {
      list = list.filter(e => e.ativo);
    }

    // Busca por nome ou identificador
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      list = list.filter(e =>
        e.nomeCompleto.toLowerCase().includes(search) ||
        e.identificador.toLowerCase().includes(search)
      );
    }

    // Ordenação
    const order = this.sortOrder();
    if (order === 'nome-asc') {
      list = [...list].sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));
    } else if (order === 'nome-desc') {
      list = [...list].sort((a, b) => b.nomeCompleto.localeCompare(a.nomeCompleto));
    } else if (order === 'identificador-asc') {
      list = [...list].sort((a, b) => a.identificador.localeCompare(b.identificador));
    } else if (order === 'mais-gastos') {
      list = [...list].sort((a, b) => this.getTotalGastos(b.id) - this.getTotalGastos(a.id));
    } else if (order === 'menos-gastos') {
      list = [...list].sort((a, b) => this.getTotalGastos(a.id) - this.getTotalGastos(b.id));
    }

    return list;
  });

  // Obter adiantamentos filtrados por data para um entregador
  getAdiantamentosEntregador(entregadorId: string): Adiantamento[] {
    let items = this.adiantamentos().filter(a => a.entregadorId === entregadorId);

    const inicio = this.dataInicio();
    const fim = this.dataFim();

    if (inicio) {
      const dataInicio = new Date(inicio + 'T00:00:00');
      items = items.filter(a => new Date(a.data) >= dataInicio);
    }
    if (fim) {
      const dataFim = new Date(fim + 'T23:59:59');
      items = items.filter(a => new Date(a.data) <= dataFim);
    }

    // Ordenar por data decrescente
    items.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return items;
  }

  // Obter adiantamentos paginados para um entregador
  getPaginatedAdiantamentos(entregadorId: string): Adiantamento[] {
    const all = this.getAdiantamentosEntregador(entregadorId);
    const page = this.getCurrentPage(entregadorId);
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return all.slice(start, end);
  }

  // Página atual de um entregador
  getCurrentPage(entregadorId: string): number {
    return this.currentPages()[entregadorId] || 1;
  }

  // Total de páginas de um entregador
  getTotalPages(entregadorId: string): number {
    const total = this.getAdiantamentosEntregador(entregadorId).length;
    return Math.max(1, Math.ceil(total / this.itemsPerPage));
  }

  // Páginas para exibir na paginação
  getPages(entregadorId: string): number[] {
    const total = this.getTotalPages(entregadorId);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Total de gastos filtrados de um entregador
  getTotalGastos(entregadorId: string): number {
    return this.getAdiantamentosEntregador(entregadorId)
      .reduce((sum, a) => sum + a.valor, 0);
  }

  // Navegação de paginação
  goToPage(entregadorId: string, page: number) {
    const total = this.getTotalPages(entregadorId);
    if (page >= 1 && page <= total) {
      this.currentPages.update(pages => ({ ...pages, [entregadorId]: page }));
    }
  }

  previousPage(entregadorId: string) {
    const current = this.getCurrentPage(entregadorId);
    if (current > 1) {
      this.goToPage(entregadorId, current - 1);
    }
  }

  nextPage(entregadorId: string) {
    const current = this.getCurrentPage(entregadorId);
    if (current < this.getTotalPages(entregadorId)) {
      this.goToPage(entregadorId, current + 1);
    }
  }

  // ===== FILTROS =====

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  toggleShowInactive() {
    this.showInactive.update(v => !v);
  }

  changeSortOrder(order: SortOrder) {
    this.sortOrder.set(order);
  }

  updateDataInicio(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dataInicio.set(input.value);
    this.resetAllPages();
  }

  updateDataFim(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dataFim.set(input.value);
    this.resetAllPages();
  }

  resetDateFilter() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    this.dataInicio.set(`${year}-${month}-01`);
    this.dataFim.set(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
    this.resetAllPages();
  }

  private resetAllPages() {
    this.currentPages.set({});
  }

  // ===== MODAL CRUD =====

  openCreateModal(entregadorId: string) {
    this.selectedEntregadorId.set(entregadorId);
    this.selectedAdiantamento.set(null);
    this.resetForm();
    // Pré-preencher data com hoje
    const today = new Date();
    this.formData.update(f => ({
      ...f,
      data: today
    }));
    this.modalType.set('create');
  }

  openEditModal(adiantamento: Adiantamento) {
    this.selectedEntregadorId.set(adiantamento.entregadorId);
    this.selectedAdiantamento.set(adiantamento);
    this.formData.set({
      descricao: adiantamento.descricao,
      data: new Date(adiantamento.data),
      valor: adiantamento.valor,
    });
    this.modalType.set('edit');
  }

  openDeleteModal(adiantamento: Adiantamento) {
    this.selectedAdiantamento.set(adiantamento);
    this.selectedEntregadorId.set(adiantamento.entregadorId);
    this.modalType.set('delete');
  }

  closeModal() {
    this.modalType.set(null);
    this.selectedAdiantamento.set(null);
    this.selectedEntregadorId.set('');
    this.resetForm();
  }

  closeModalBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  // Validação
  validateForm(): boolean {
    const errors = { descricao: '', data: '', valor: '' };
    const data = this.formData();

    if (!data.descricao.trim()) {
      errors.descricao = 'Descrição é obrigatória';
    } else if (data.descricao.trim().length < 3) {
      errors.descricao = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!data.data) {
      errors.data = 'Data é obrigatória';
    }

    if (!data.valor || data.valor <= 0) {
      errors.valor = 'Valor deve ser maior que zero';
    }

    this.formErrors.set(errors);
    return !errors.descricao && !errors.data && !errors.valor;
  }

  // Salvar (criar ou editar)
  saveAdiantamento() {
    if (!this.validateForm()) return;

    const data = this.formData();

    if (this.modalType() === 'create') {
      this.adiantamentoService.createAdiantamento(this.selectedEntregadorId(), data);
    } else if (this.modalType() === 'edit' && this.selectedAdiantamento()) {
      this.adiantamentoService.updateAdiantamento(this.selectedAdiantamento()!.id, data);
    }

    this.closeModal();
  }

  // Confirmar exclusão
  confirmDelete() {
    const adiantamento = this.selectedAdiantamento();
    if (adiantamento) {
      this.adiantamentoService.deleteAdiantamento(adiantamento.id);
      this.closeModal();
    }
  }

  // ===== HELPERS =====

  getEntregadorNome(entregadorId: string): string {
    const e = this.entregadores().find(ent => ent.id === entregadorId);
    return e ? e.nomeCompleto : '';
  }

  getEntregadorIdentificador(entregadorId: string): string {
    const e = this.entregadores().find(ent => ent.id === entregadorId);
    return e ? e.identificador : '';
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

  updateFormDescricao(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(f => ({ ...f, descricao: input.value }));
  }

  updateFormData(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(f => ({ ...f, data: new Date(input.value + 'T00:00:00') }));
  }

  updateFormValor(event: Event) {
    const input = event.target as HTMLInputElement;
    this.formData.update(f => ({ ...f, valor: parseFloat(input.value) || 0 }));
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map(n => n[0])
      .filter((_, i, arr) => i === 0 || i === arr.length - 1)
      .join('')
      .toUpperCase();
  }

  private resetForm() {
    this.formData.set({
      descricao: '',
      data: new Date(),
      valor: 0,
    });
    this.formErrors.set({
      descricao: '',
      data: '',
      valor: '',
    });
  }
}