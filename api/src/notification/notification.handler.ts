import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { ProcessedMessageDTO } from './dto/processed-message.dto';

@Injectable()
export class NotificationHandler {
  private readonly logger = new Logger(NotificationHandler.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @RabbitSubscribe({
    exchange: 'notification.exchange',
    routingKey: 'notification_created',
    queue: process.env.RABBITMQ_ENTRY_QUEUE,
  })
  async handleNotificationCreated(notification: CreateNotificationDTO) {
    this.logger.log('Notification received: ' + notification.mensagemId);

    await this.notificationService.processNotification(notification);

    this.logger.log(
      'Notification processing completed: ' + notification.mensagemId,
    );
  }

  @RabbitSubscribe({
    exchange: 'notification.exchange',
    routingKey: 'notification_status',
    queue: process.env.RABBITMQ_STATUS_QUEUE,
  })
  async handleNotificationStatus(message: ProcessedMessageDTO) {
    this.logger.log('Notification status received: ' + message.mensagemId);

    this.notificationGateway.emitStatusNotification(message);

    this.logger.log('Notification status processed: ' + message.mensagemId);
  }
}
