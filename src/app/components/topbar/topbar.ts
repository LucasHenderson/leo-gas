import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { Notificacao } from '../../models/notification.model';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);

  @Output() toggleSidebar = new EventEmitter<void>();
  isMenuOpen = false;
  isNotificationModalOpen = signal(false);

  // Agora vem do serviço real
  notificationCount = this.notificationService.contadorNaoLidas;
  notificacoesAtivas = this.notificationService.notificacoesAtivas;

  // Expondo o sinal do tema para o template
  isDarkMode = this.themeService.isDarkMode;

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  openNotifications() {
    this.isNotificationModalOpen.set(true);
    this.isMenuOpen = false;
  }

  closeNotificationModal() {
    this.isNotificationModalOpen.set(false);
  }

  closeNotificationModalBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('notification-modal-overlay')) {
      this.closeNotificationModal();
    }
  }

  marcarComoLida(id: string) {
    this.notificationService.marcarComoLida(id);
  }

  marcarTodasComoLidas() {
    this.notificationService.marcarTodasComoLidas();
    this.closeNotificationModal();
  }

  formatarDataHora(data: Date): string {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  logout() {
    this.isMenuOpen = false;
    this.router.navigate(['/login']);
  }
}