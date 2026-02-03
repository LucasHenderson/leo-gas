import { Injectable, signal } from '@angular/core';
import { Entregador, EntregadorFormData } from '../models/entregador.model';

@Injectable({
  providedIn: 'root'
})
export class EntregadorService {
  private entregadores = signal<Entregador[]>([
    {
      id: '1',
      nomeCompleto: 'João Silva Santos',
      telefone: '(63)98765-4321',
      identificador: 'JSS',
      ativo: true,
      dataCadastro: new Date('2023-01-15')
    },
    {
      id: '2',
      nomeCompleto: 'Maria Oliveira Costa',
      telefone: '(63)99876-5432',
      identificador: 'MOC',
      ativo: true,
      dataCadastro: new Date('2023-02-20')
    },
    {
      id: '3',
      nomeCompleto: 'Pedro Henrique Almeida',
      telefone: '(63)98123-4567',
      identificador: 'PHA',
      ativo: true,
      dataCadastro: new Date('2023-03-10')
    },
    {
      id: '4',
      nomeCompleto: 'Ana Paula Ferreira',
      telefone: '(63)99234-5678',
      identificador: 'APF',
      ativo: false,
      dataCadastro: new Date('2023-01-25')
    },
    {
      id: '5',
      nomeCompleto: 'Carlos Eduardo Souza',
      telefone: '(63)98345-6789',
      identificador: 'CES',
      ativo: true,
      dataCadastro: new Date('2023-04-05')
    },
    {
      id: '6',
      nomeCompleto: 'Juliana Rodrigues Lima',
      telefone: '(63)99456-7890',
      identificador: 'JRL',
      ativo: true,
      dataCadastro: new Date('2023-05-12')
    },
    {
      id: '7',
      nomeCompleto: 'Rafael Santos Barbosa',
      telefone: '(63)98567-8901',
      identificador: 'RSB',
      ativo: true,
      dataCadastro: new Date('2023-06-18')
    },
    {
      id: '8',
      nomeCompleto: 'Fernanda Costa Pereira',
      telefone: '(63)99678-9012',
      identificador: 'FCP',
      ativo: true,
      dataCadastro: new Date('2023-07-22')
    },
    {
      id: '9',
      nomeCompleto: 'Lucas Martins Oliveira',
      telefone: '(63)98789-0123',
      identificador: 'LMO',
      ativo: false,
      dataCadastro: new Date('2023-02-14')
    },
    {
      id: '10',
      nomeCompleto: 'Camila Alves Ribeiro',
      telefone: '(63)99890-1234',
      identificador: 'CAR',
      ativo: true,
      dataCadastro: new Date('2023-08-30')
    },
    {
      id: '11',
      nomeCompleto: 'Bruno Henrique Dias',
      telefone: '(63)98901-2345',
      identificador: 'BHD',
      ativo: true,
      dataCadastro: new Date('2023-09-15')
    },
    {
      id: '12',
      nomeCompleto: 'Patricia Gomes Silva',
      telefone: '(63)99012-3456',
      identificador: 'PGS',
      ativo: true,
      dataCadastro: new Date('2023-10-20')
    }
  ]);

  getEntregadores() {
    return this.entregadores.asReadonly();
  }

  createEntregador(data: EntregadorFormData): boolean {
    // Verifica se o identificador já existe
    if (this.identificadorExists(data.identificador)) {
      return false;
    }

    const newEntregador: Entregador = {
      id: this.generateId(),
      ...data,
      ativo: true,
      dataCadastro: new Date()
    };

    this.entregadores.update(list => [...list, newEntregador]);
    return true;
  }

  updateEntregador(id: string, data: EntregadorFormData): boolean {
    // Verifica se o identificador já existe em outro entregador
    const existingEntregador = this.entregadores().find(
      e => e.identificador === data.identificador && e.id !== id
    );
    
    if (existingEntregador) {
      return false;
    }

    this.entregadores.update(list =>
      list.map(e => e.id === id ? { ...e, ...data } : e)
    );
    return true;
  }

  toggleEntregadorStatus(id: string): void {
    this.entregadores.update(list =>
      list.map(e => e.id === id ? { ...e, ativo: !e.ativo } : e)
    );
  }

  identificadorExists(identificador: string, excludeId?: string): boolean {
    return this.entregadores().some(
      e => e.identificador.toLowerCase() === identificador.toLowerCase() && 
           (!excludeId || e.id !== excludeId)
    );
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}