import { Injectable, signal, computed, inject } from '@angular/core';
import { Adiantamento, AdiantamentoFormData } from '../models/adiantamento.model';
import { EntregadorService } from './entregador.service';

@Injectable({
  providedIn: 'root'
})
export class AdiantamentoService {
  private entregadorService = inject(EntregadorService);

  private adiantamentos = signal<Adiantamento[]>([
    // João Silva Santos (JSS)
    { id: '1', entregadorId: '1', descricao: 'Combustível moto', data: new Date('2026-02-01'), valor: 85.00 },
    { id: '2', entregadorId: '1', descricao: 'Almoço rota centro', data: new Date('2026-02-03'), valor: 32.50 },
    { id: '3', entregadorId: '1', descricao: 'Troca de óleo', data: new Date('2026-02-05'), valor: 120.00 },
    { id: '4', entregadorId: '1', descricao: 'Combustível moto', data: new Date('2026-02-07'), valor: 90.00 },
    { id: '5', entregadorId: '1', descricao: 'Água e lanche', data: new Date('2026-02-08'), valor: 18.00 },
    { id: '6', entregadorId: '1', descricao: 'Estacionamento shopping', data: new Date('2026-02-09'), valor: 15.00 },
    { id: '7', entregadorId: '1', descricao: 'Combustível moto', data: new Date('2026-02-10'), valor: 80.00 },
    { id: '8', entregadorId: '1', descricao: 'Almoço rota sul', data: new Date('2026-02-11'), valor: 28.00 },
    { id: '9', entregadorId: '1', descricao: 'Reparo pneu traseiro', data: new Date('2026-02-12'), valor: 65.00 },
    { id: '10', entregadorId: '1', descricao: 'Pedágio BR-153', data: new Date('2026-02-12'), valor: 12.50 },
    { id: '11', entregadorId: '1', descricao: 'Combustível moto', data: new Date('2026-01-15'), valor: 95.00 },
    { id: '12', entregadorId: '1', descricao: 'Almoço rota norte', data: new Date('2026-01-20'), valor: 35.00 },

    // Maria Oliveira Costa (MOC)
    { id: '13', entregadorId: '2', descricao: 'Gasolina veículo', data: new Date('2026-02-02'), valor: 150.00 },
    { id: '14', entregadorId: '2', descricao: 'Almoço delivery', data: new Date('2026-02-04'), valor: 29.90 },
    { id: '15', entregadorId: '2', descricao: 'Manutenção freio', data: new Date('2026-02-06'), valor: 230.00 },
    { id: '16', entregadorId: '2', descricao: 'Combustível', data: new Date('2026-02-08'), valor: 140.00 },
    { id: '17', entregadorId: '2', descricao: 'Lanche tarde', data: new Date('2026-02-10'), valor: 22.00 },
    { id: '18', entregadorId: '2', descricao: 'Lavagem veículo', data: new Date('2026-02-11'), valor: 45.00 },

    // Pedro Henrique Almeida (PHA)
    { id: '19', entregadorId: '3', descricao: 'Combustível', data: new Date('2026-02-01'), valor: 100.00 },
    { id: '20', entregadorId: '3', descricao: 'Almoço expediente', data: new Date('2026-02-03'), valor: 35.00 },
    { id: '21', entregadorId: '3', descricao: 'Troca correia', data: new Date('2026-02-07'), valor: 180.00 },
    { id: '22', entregadorId: '3', descricao: 'Combustível', data: new Date('2026-02-09'), valor: 110.00 },
    { id: '23', entregadorId: '3', descricao: 'Água mineral', data: new Date('2026-02-11'), valor: 8.00 },

    // Carlos Eduardo Souza (CES)
    { id: '24', entregadorId: '5', descricao: 'Gasolina moto', data: new Date('2026-02-02'), valor: 75.00 },
    { id: '25', entregadorId: '5', descricao: 'Almoço centro', data: new Date('2026-02-05'), valor: 27.50 },
    { id: '26', entregadorId: '5', descricao: 'Combustível', data: new Date('2026-02-08'), valor: 82.00 },
    { id: '27', entregadorId: '5', descricao: 'Manutenção corrente', data: new Date('2026-02-10'), valor: 55.00 },

    // Ana Paula Ferreira (APF) - inativa
    { id: '28', entregadorId: '4', descricao: 'Combustível', data: new Date('2026-01-10'), valor: 90.00 },
    { id: '29', entregadorId: '4', descricao: 'Almoço', data: new Date('2026-01-12'), valor: 30.00 },
    { id: '30', entregadorId: '4', descricao: 'Reparo guidão', data: new Date('2026-02-01'), valor: 45.00 },

    // Juliana Rodrigues Lima (JRL)
    { id: '31', entregadorId: '6', descricao: 'Combustível', data: new Date('2026-02-03'), valor: 88.00 },
    { id: '32', entregadorId: '6', descricao: 'Almoço rota leste', data: new Date('2026-02-06'), valor: 33.00 },
    { id: '33', entregadorId: '6', descricao: 'Combustível', data: new Date('2026-02-09'), valor: 92.00 },
    { id: '34', entregadorId: '6', descricao: 'Lanche noturno', data: new Date('2026-02-11'), valor: 19.50 },

    // Rafael Santos Barbosa (RSB)
    { id: '35', entregadorId: '7', descricao: 'Gasolina', data: new Date('2026-02-01'), valor: 105.00 },
    { id: '36', entregadorId: '7', descricao: 'Almoço delivery', data: new Date('2026-02-04'), valor: 31.00 },
    { id: '37', entregadorId: '7', descricao: 'Troca pastilha freio', data: new Date('2026-02-07'), valor: 95.00 },
    { id: '38', entregadorId: '7', descricao: 'Combustível', data: new Date('2026-02-10'), valor: 98.00 },

    // Fernanda Costa Pereira (FCP)
    { id: '39', entregadorId: '8', descricao: 'Combustível', data: new Date('2026-02-02'), valor: 78.00 },
    { id: '40', entregadorId: '8', descricao: 'Almoço', data: new Date('2026-02-05'), valor: 26.00 },
    { id: '41', entregadorId: '8', descricao: 'Combustível', data: new Date('2026-02-08'), valor: 85.00 },

    // Camila Alves Ribeiro (CAR)
    { id: '42', entregadorId: '10', descricao: 'Gasolina', data: new Date('2026-02-04'), valor: 95.00 },
    { id: '43', entregadorId: '10', descricao: 'Almoço expediente', data: new Date('2026-02-07'), valor: 30.00 },
    { id: '44', entregadorId: '10', descricao: 'Combustível', data: new Date('2026-02-10'), valor: 88.00 },
    { id: '45', entregadorId: '10', descricao: 'Manutenção farol', data: new Date('2026-02-12'), valor: 42.00 },
  ]);

  getAdiantamentos() {
    return this.adiantamentos;
  }

  getAdiantamentosByEntregador(entregadorId: string): Adiantamento[] {
    return this.adiantamentos().filter(a => a.entregadorId === entregadorId);
  }

  createAdiantamento(entregadorId: string, data: AdiantamentoFormData): boolean {
    const novoAdiantamento: Adiantamento = {
      id: Date.now().toString(),
      entregadorId,
      descricao: data.descricao,
      data: new Date(data.data),
      valor: data.valor
    };

    this.adiantamentos.update(list => [...list, novoAdiantamento]);
    return true;
  }

  updateAdiantamento(id: string, data: AdiantamentoFormData): boolean {
    this.adiantamentos.update(list =>
      list.map(a =>
        a.id === id
          ? { ...a, descricao: data.descricao, data: new Date(data.data), valor: data.valor }
          : a
      )
    );
    return true;
  }

  deleteAdiantamento(id: string): boolean {
    this.adiantamentos.update(list => list.filter(a => a.id !== id));
    return true;
  }
}