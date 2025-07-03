import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ProcessedMessageDTO } from './dto/processed-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  emitStatusNotification(data: ProcessedMessageDTO) {
    this.server.emit('processed_message', data);
  }
}
