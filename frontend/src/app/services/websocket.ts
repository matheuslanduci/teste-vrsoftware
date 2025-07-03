import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ProcessStatus } from '../../data';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Websocket {
  constructor(private socket: Socket) {
    this.connect();
  }

  onNotificationStatusUpdate(): Observable<{
    mensagemId: string;
    status: ProcessStatus;
  }> {
    return this.socket.fromEvent('processed_message');
  }

  connect() {
    if (!this.socket.ioSocket.connected) {
      this.socket.connect();
      console.log('WebSocket connected');
    }
  }

  disconnect() {
    if (this.socket.ioSocket.connected) {
      this.socket.disconnect();
      console.log('WebSocket disconnected');
    }
  }

  isConnected(): boolean {
    return this.socket.ioSocket.connected;
  }
}
