import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MessageNotification, ProcessStatus } from '../../../data';
import { Subject, takeUntil, interval } from 'rxjs';
import { Notification as NotificationService } from '../../services/notification';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit, OnDestroy {
  public message: string = '';
  public messages: MessageNotification[] = [];
  public isLoading: boolean = false;
  public isWebSocketConnected: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages) => {
        this.messages = messages;
      });

    // Check websocket connection status periodically
    interval(2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const wasConnected = this.isWebSocketConnected;
        this.isWebSocketConnected =
          this.notificationService.getWebSocketConnectionStatus();

        if (!wasConnected && this.isWebSocketConnected) {
          this.snackBar.open('WebSocket conectado!', 'Fechar', {
            duration: 2000,
          });
        } else if (wasConnected && !this.isWebSocketConnected) {
          this.snackBar.open(
            'WebSocket desconectado! Tentando reconectar...',
            'Fechar',
            {
              duration: 3000,
            }
          );
          this.notificationService.reconnectWebSocket();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSendMessage(): void {
    if (!this.message.trim()) {
      this.snackBar.open('Mensagem não pode ser vazia', 'Fechar', {
        duration: 3000,
      });
      return;
    }

    if (!this.isWebSocketConnected) {
      this.snackBar.open(
        'WebSocket desconectado! Verificando conexão...',
        'Fechar',
        {
          duration: 3000,
        }
      );
      this.notificationService.reconnectWebSocket();
    }

    this.isLoading = true;

    this.notificationService
      .sendNotification(this.message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open('Notificação enviada com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.message = '';
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Erro ao enviar notificação!', 'Fechar', {
            duration: 3000,
          });
          console.error('Error sending notification:', error);
          this.isLoading = false;
        },
      });
  }

  onReconnectWebSocket(): void {
    this.notificationService.reconnectWebSocket();
    this.snackBar.open('Tentando reconectar WebSocket...', 'Fechar', {
      duration: 2000,
    });
  }

  onClearNotifications(): void {
    this.notificationService.clearNotifications();
    this.snackBar.open('Notificações limpas!', 'Fechar', {
      duration: 2000,
    });
  }

  getStatusClass(status: ProcessStatus): string {
    switch (status) {
      case ProcessStatus.PENDING:
        return 'status-pending';
      case ProcessStatus.SUCCESS:
        return 'status-success';
      case ProcessStatus.FAILED:
        return 'status-error';
      default:
        return '';
    }
  }

  getStatusIcon(status: ProcessStatus): string {
    switch (status) {
      case ProcessStatus.PENDING:
        return 'hourglass_empty';
      case ProcessStatus.SUCCESS:
        return 'check_circle';
      case ProcessStatus.FAILED:
        return 'error';
      default:
        return 'help';
    }
  }

  trackByMessageId(index: number, notification: MessageNotification): string {
    return notification.mensagemId;
  }
}
