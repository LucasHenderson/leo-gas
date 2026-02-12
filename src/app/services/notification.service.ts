import { Injectable, signal, computed } from '@angular/core';
import { Notificacao } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificacoes = signal<Notificacao[]>(this.carregarDoStorage());

  // Intervalo para checar notificações agendadas
  private intervalId: any = null;

  constructor() {
    this.iniciarVerificacao();
  }

  getNotificacoes() {
    return this.notificacoes.asReadonly();
  }

  // Retorna apenas as notificações não lidas E que já chegaram na data agendada
  notificacoesAtivas = computed(() => {
    const agora = new Date();
    return this.notificacoes().filter(n => !n.lida && new Date(n.dataAgendada) <= agora);
  });

  contadorNaoLidas = computed(() => {
    return this.notificacoesAtivas().length;
  });

  adicionarNotificacao(dados: Omit<Notificacao, 'id' | 'lida' | 'criadaEm'>): Notificacao {
    const nova: Notificacao = {
      ...dados,
      id: this.generateId(),
      lida: false,
      criadaEm: new Date()
    };

    this.notificacoes.update(list => [...list, nova]);
    this.salvarNoStorage();
    return nova;
  }

  marcarComoLida(id: string): void {
    this.notificacoes.update(list =>
      list.map(n => n.id === id ? { ...n, lida: true } : n)
    );
    this.salvarNoStorage();
  }

  marcarTodasComoLidas(): void {
    this.notificacoes.update(list =>
      list.map(n => ({ ...n, lida: true }))
    );
    this.salvarNoStorage();
  }

  removerNotificacao(id: string): void {
    this.notificacoes.update(list => list.filter(n => n.id !== id));
    this.salvarNoStorage();
  }

  // Verifica a cada 30 segundos se alguma notificação agendada já deve aparecer
  private iniciarVerificacao(): void {
    this.intervalId = setInterval(() => {
      // Força recalcular o computed ao "tocar" o signal
      this.notificacoes.update(list => [...list]);
    }, 30000); // 30 segundos
  }

  private salvarNoStorage(): void {
    try {
      localStorage.setItem('notificacoes', JSON.stringify(this.notificacoes()));
    } catch (e) {
      console.warn('Erro ao salvar notificações no localStorage', e);
    }
  }

  private carregarDoStorage(): Notificacao[] {
    try {
      const dados = localStorage.getItem('notificacoes');
      if (dados) {
        return JSON.parse(dados);
      }
    } catch (e) {
      console.warn('Erro ao carregar notificações do localStorage', e);
    }
    return [];
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}