import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntregadorService } from '../../services/entregador.service';
import { Entregador, EntregadorFormData } from '../../models/entregador.model';

type ModalType = 'create' | 'edit' | 'deactivate' | null;

@Component({
  selector: 'app-entregadores',
  imports: [CommonModule, FormsModule],
  templateUrl: './entregadores.html',
  styleUrl: './entregadores.css',
})
export class Entregadores {
  private entregadorService = inject(EntregadorService);

  // Paginação
  currentPage = signal(1);
  itemsPerPage = signal(6);
  
  // Modal
  modalType = signal<ModalType>(null);
  selectedEntregador = signal<Entregador | null>(null);
  
  // Formulário
  formData = signal<EntregadorFormData>({
    nomeCompleto: '',
    telefone: '',
    identificador: ''
  });
  
  formErrors = signal({
    nomeCompleto: '',
    telefone: '',
    identificador: ''
  });

  // Filtro
  showInactive = signal(false);

  // Computed
  entregadores = this.entregadorService.getEntregadores();
  
  filteredEntregadores = computed(() => {
    const list = this.entregadores();
    return this.showInactive() 
      ? list 
      : list.filter(e => e.ativo);
  });

  totalPages = computed(() => 
    Math.ceil(this.filteredEntregadores().length / this.itemsPerPage())
  );

  paginatedEntregadores = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredEntregadores().slice(start, end);
  });

  pages = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Ações de Modal
  openCreateModal() {
    this.resetForm();
    this.modalType.set('create');
  }

  openEditModal(entregador: Entregador) {
    this.selectedEntregador.set(entregador);
    this.formData.set({
      nomeCompleto: entregador.nomeCompleto,
      telefone: entregador.telefone,
      identificador: entregador.identificador
    });
    this.modalType.set('edit');
  }

  openDeactivateModal(entregador: Entregador) {
    this.selectedEntregador.set(entregador);
    this.modalType.set('deactivate');
  }

  closeModal() {
    this.modalType.set(null);
    this.selectedEntregador.set(null);
    this.resetForm();
  }

  // Validação
  validateForm(): boolean {
    const errors = {
      nomeCompleto: '',
      telefone: '',
      identificador: ''
    };

    const data = this.formData();

    if (!data.nomeCompleto.trim()) {
      errors.nomeCompleto = 'Nome completo é obrigatório';
    } else if (data.nomeCompleto.trim().length < 3) {
      errors.nomeCompleto = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!data.telefone) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\d{5}-\d{4}$/.test(data.telefone)) {
      errors.telefone = 'Telefone inválido. Use o formato (99)99999-9999';
    }

    if (!data.identificador.trim()) {
      errors.identificador = 'Identificador é obrigatório';
    } else if (!/^[A-Za-z]{1,3}$/.test(data.identificador)) {
      errors.identificador = 'Identificador deve ter até 3 letras';
    } else {
      const excludeId = this.selectedEntregador()?.id;
      if (this.entregadorService.identificadorExists(data.identificador, excludeId)) {
        errors.identificador = 'Este identificador já está em uso';
      }
    }

    this.formErrors.set(errors);
    return !errors.nomeCompleto && !errors.telefone && !errors.identificador;
  }

  // Máscara de telefone
  applyPhoneMask(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    if (value.length > 6) {
      value = `(${value.slice(0, 2)})${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)})${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    this.formData.update(data => ({ ...data, telefone: value }));
  }

  // Formatar identificador para maiúsculas
  formatIdentificador(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
    this.formData.update(data => ({ ...data, identificador: value }));
  }

  // Ações CRUD
  handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const data = this.formData();
    const isEdit = this.modalType() === 'edit';
    const success = isEdit
      ? this.entregadorService.updateEntregador(this.selectedEntregador()!.id, data)
      : this.entregadorService.createEntregador(data);

    if (success) {
      this.closeModal();
    }
  }

  confirmDeactivate() {
    const entregador = this.selectedEntregador();
    if (entregador) {
      this.entregadorService.toggleEntregadorStatus(entregador.id);
      this.closeModal();
    }
  }

  // Paginação
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

  toggleShowInactive() {
    this.showInactive.update(v => !v);
    this.currentPage.set(1); // Reset para primeira página
  }

  private resetForm() {
    this.formData.set({
      nomeCompleto: '',
      telefone: '',
      identificador: ''
    });
    this.formErrors.set({
      nomeCompleto: '',
      telefone: '',
      identificador: ''
    });
  }
}