import { Injectable, signal } from '@angular/core';
import { VariavelEstoque, VariavelEstoqueFormData } from '../models/variavel-estoque.model';

@Injectable({
  providedIn: 'root'
})
export class VariavelEstoqueService {
  private variaveis = signal<VariavelEstoque[]>([
    {
      id: '1',
      nome: 'Gás P13',
      quantidade: 70
    },
    {
      id: '2',
      nome: 'Água 20L',
      quantidade: 100
    },
    {
      id: '3',
      nome: 'Registro/Mangueira',
      quantidade: 15
    },
    {
      id: '4',
      nome: 'Brindes',
      quantidade: 50
    }
  ]);

  getVariaveis() {
    return this.variaveis.asReadonly();
  }

  getVariavelById(id: string): VariavelEstoque | undefined {
    return this.variaveis().find(v => v.id === id);
  }

  createVariavel(data: VariavelEstoqueFormData): boolean {
    // Verifica se já existe uma variável com o mesmo nome
    const exists = this.variaveis().some(
      v => v.nome.toLowerCase() === data.nome.toLowerCase()
    );
    
    if (exists) {
      return false;
    }

    const newVariavel: VariavelEstoque = {
      id: this.generateId(),
      nome: data.nome,
      quantidade: data.quantidade
    };

    this.variaveis.update(list => [...list, newVariavel]);
    return true;
  }

  updateVariavel(id: string, data: VariavelEstoqueFormData): boolean {
    // Verifica se o nome já existe em outra variável
    const exists = this.variaveis().some(
      v => v.nome.toLowerCase() === data.nome.toLowerCase() && v.id !== id
    );
    
    if (exists) {
      return false;
    }

    this.variaveis.update(list =>
      list.map(v => v.id === id ? { ...v, ...data } : v)
    );
    return true;
  }

  deleteVariavel(id: string): boolean {
    // Aqui poderia verificar se há produtos vinculados antes de excluir
    this.variaveis.update(list => list.filter(v => v.id !== id));
    return true;
  }

  // Método para reduzir estoque quando uma venda é realizada
  reduzirEstoque(id: string, quantidade: number): boolean {
    const variavel = this.variaveis().find(v => v.id === id);
    if (!variavel || variavel.quantidade < quantidade) {
      return false;
    }

    this.variaveis.update(list =>
      list.map(v => v.id === id ? { ...v, quantidade: v.quantidade - quantidade } : v)
    );
    return true;
  }

  // Método para aumentar estoque
  aumentarEstoque(id: string, quantidade: number): void {
    this.variaveis.update(list =>
      list.map(v => v.id === id ? { ...v, quantidade: v.quantidade + quantidade } : v)
    );
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}