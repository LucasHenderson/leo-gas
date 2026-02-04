import { Injectable, signal, computed } from '@angular/core';
import { Endereco, EnderecoFormData, QuadraResumo } from '../models/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private enderecos = signal<Endereco[]>([
    {
      id: '1',
      quadra: '104 Norte',
      alameda: '01',
      qi: '',
      lote: '15',
      casa: 'A',
      complemento: 'Próximo ao mercado',
      clientesIds: ['1', '2']
    },
    {
      id: '2',
      quadra: '104 Norte',
      alameda: '03',
      qi: '',
      lote: '22',
      casa: '',
      complemento: '',
      clientesIds: ['3']
    },
    {
      id: '3',
      quadra: '104 Norte',
      alameda: '05',
      qi: '',
      lote: '08',
      casa: 'B',
      complemento: 'Casa azul',
      clientesIds: ['4']
    },
    {
      id: '4',
      quadra: '110 Norte',
      alameda: '02',
      qi: '',
      lote: '30',
      casa: '',
      complemento: 'Esquina',
      clientesIds: ['5', '6']
    },
    {
      id: '5',
      quadra: '110 Norte',
      alameda: '10',
      qi: 'QI-05',
      lote: '12',
      casa: 'C',
      complemento: '',
      clientesIds: ['7']
    },
    {
      id: '6',
      quadra: '203 Sul',
      alameda: '04',
      qi: '',
      lote: '18',
      casa: '',
      complemento: 'Portão verde',
      clientesIds: ['8', '9']
    },
    {
      id: '7',
      quadra: '203 Sul',
      alameda: '08',
      qi: '',
      lote: '25',
      casa: 'A',
      complemento: '',
      clientesIds: ['10']
    },
    {
      id: '8',
      quadra: '305 Sul',
      alameda: '01',
      qi: 'QI-02',
      lote: '05',
      casa: '',
      complemento: 'Ao lado da padaria',
      clientesIds: ['1', '11']
    },
    {
      id: '9',
      quadra: '305 Sul',
      alameda: '06',
      qi: '',
      lote: '14',
      casa: 'B',
      complemento: '',
      clientesIds: ['12']
    },
    {
      id: '10',
      quadra: '408 Norte',
      alameda: '12',
      qi: '',
      lote: '33',
      casa: '',
      complemento: 'Casa de esquina amarela',
      clientesIds: ['3', '5']
    }
  ]);

  getEnderecos() {
    return this.enderecos.asReadonly();
  }

  getEnderecoById(id: string): Endereco | undefined {
    return this.enderecos().find(e => e.id === id);
  }

  getEnderecosByIds(ids: string[]): Endereco[] {
    return this.enderecos().filter(e => ids.includes(e.id));
  }

  getEnderecoFormatado(endereco: Endereco): string {
    const partes: string[] = [];
    if (endereco.quadra) partes.push(`Qd. ${endereco.quadra}`);
    if (endereco.alameda) partes.push(`Al. ${endereco.alameda}`);
    if (endereco.qi) partes.push(endereco.qi);
    if (endereco.lote) partes.push(`Lt. ${endereco.lote}`);
    if (endereco.casa) partes.push(`Casa ${endereco.casa}`);
    if (endereco.complemento) partes.push(`(${endereco.complemento})`);
    return partes.join(', ') || 'Endereço não informado';
  }

  getQuadrasResumo(): QuadraResumo[] {
    const quadrasMap = new Map<string, number>();
    
    this.enderecos().forEach(endereco => {
      if (endereco.quadra) {
        const count = quadrasMap.get(endereco.quadra) || 0;
        quadrasMap.set(endereco.quadra, count + 1);
      }
    });

    const resumo: QuadraResumo[] = [];
    quadrasMap.forEach((total, quadra) => {
      resumo.push({ quadra, totalEnderecos: total });
    });

    return resumo.sort((a, b) => b.totalEnderecos - a.totalEnderecos);
  }

  createEndereco(data: EnderecoFormData): Endereco {
    const newEndereco: Endereco = {
      id: this.generateId(),
      ...data
    };

    this.enderecos.update(list => [...list, newEndereco]);
    return newEndereco;
  }

  updateEndereco(id: string, data: EnderecoFormData): boolean {
    this.enderecos.update(list =>
      list.map(e => e.id === id ? { ...e, ...data } : e)
    );
    return true;
  }

  deleteEndereco(id: string): string[] {
    const endereco = this.enderecos().find(e => e.id === id);
    const clientesAfetados = endereco?.clientesIds || [];
    
    this.enderecos.update(list => list.filter(e => e.id !== id));
    return clientesAfetados;
  }

  // Adiciona cliente ao endereço
  vincularCliente(enderecoId: string, clienteId: string): void {
    this.enderecos.update(list =>
      list.map(e => {
        if (e.id === enderecoId && !e.clientesIds.includes(clienteId)) {
          return { ...e, clientesIds: [...e.clientesIds, clienteId] };
        }
        return e;
      })
    );
  }

  // Remove cliente do endereço
  desvincularCliente(enderecoId: string, clienteId: string): void {
    this.enderecos.update(list =>
      list.map(e => {
        if (e.id === enderecoId) {
          return { ...e, clientesIds: e.clientesIds.filter(id => id !== clienteId) };
        }
        return e;
      })
    );
  }

  // Remove cliente de todos os endereços
  removerClienteDeTodosEnderecos(clienteId: string): void {
    this.enderecos.update(list =>
      list.map(e => ({
        ...e,
        clientesIds: e.clientesIds.filter(id => id !== clienteId)
      }))
    );
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}