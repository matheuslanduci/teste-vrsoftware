import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil, Subscription } from 'rxjs';
import { MessageNotification, ProcessStatus } from '../../data';
import { HttpClient } from '@angular/common/http';
import { v4 } from 'uuid';
import { Websocket } from './websocket';

@Injectable({
  providedIn: 'root',
})
export class Notification implements OnDestroy {
  private readonly baseUrl = 'http://localhost:3000';
  private destroy$ = new Subject<void>();
  private websocketSubscription?: Subscription;

  private notificationsSubject = new BehaviorSubject<MessageNotification[]>([]);

  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private httpClient: HttpClient, private websocket: Websocket) {
    this.initializeWebSocketSubscription();
  }

  private initializeWebSocketSubscription() {
    if (!this.websocketSubscription) {
      this.websocketSubscription = this.websocket
        .onNotificationStatusUpdate()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (statusUpdate) => {
            console.log('Received status update:', statusUpdate);
            this.updateNotificationStatus(
              statusUpdate.mensagemId,
              statusUpdate.status
            );
          },
          error: (error) => {
            console.error('WebSocket error:', error);
          },
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    this.websocket.disconnect();
  }

  public sendNotification(message: string) {
    const notification: MessageNotification = {
      mensagemId: v4(),
      conteudoMensagem: message,
      status: ProcessStatus.PENDING,
    };

    this.addNotificationOptimistically(notification);

    return this.httpClient.post<MessageNotification>(
      `${this.baseUrl}/notification`,
      notification
    );
  }

  private addNotificationOptimistically(notification: MessageNotification) {
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next([...currentNotifications, notification]);
  }

  public updateNotificationStatus(mensagemId: string, status: ProcessStatus) {
    const currentNotifications = this.notificationsSubject.getValue();

    const updatedNotifications = currentNotifications.map((notification) => {
      if (notification.mensagemId === mensagemId) {
        return { ...notification, status };
      }
      return notification;
    });

    this.notificationsSubject.next(updatedNotifications);
  }

  public getWebSocketConnectionStatus(): boolean {
    return this.websocket.isConnected();
  }

  public reconnectWebSocket() {
    if (!this.websocket.isConnected()) {
      this.websocket.connect();
      if (this.websocketSubscription) {
        this.websocketSubscription.unsubscribe();
        this.websocketSubscription = undefined;
      }
      this.initializeWebSocketSubscription();
    }
  }

  public getNotifications(): MessageNotification[] {
    return this.notificationsSubject.getValue();
  }

  public clearNotifications() {
    this.notificationsSubject.next([]);
  }
}
