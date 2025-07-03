import { Injectable, Logger } from '@nestjs/common';

import { CreateNotificationDTO } from './dto/create-notification.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  ProcessedMessageDTO,
  ProcessStatus,
} from './dto/processed-message.dto';
import { notificationData } from '../data';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  public generateRandomNumber() {
    return Math.floor(Math.random() * 10) + 1;
  }

  async send(createNotificationDTO: CreateNotificationDTO) {
    this.logger.log(
      'Sending notification with ID: ' + createNotificationDTO.mensagemId,
    );

    const result = await this.amqpConnection.publish(
      'notification.exchange',
      'notification_created',
      createNotificationDTO,
    );

    if (!result) {
      this.logger.error('Failed to send notification');
      throw new Error('Failed to send notification');
    }

    notificationData.set(
      createNotificationDTO.mensagemId,
      createNotificationDTO,
    );

    this.logger.log('Notification sent successfully');
  }

  async processNotification(
    createNotificationDTO: CreateNotificationDTO,
  ): Promise<void> {
    this.logger.log(
      'Processing notification with ID: ' + createNotificationDTO.mensagemId,
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000),
    );

    const randomNumber = this.generateRandomNumber();

    // Sucesso quando o número é maior que 2
    if (randomNumber > 2) {
      this.logger.log(
        'Notification processed successfully: ' +
          createNotificationDTO.mensagemId,
      );

      await this.amqpConnection.publish(
        'notification.exchange',
        'notification_status',
        {
          mensagemId: createNotificationDTO.mensagemId,
          status: ProcessStatus.SUCCESS,
        } as ProcessedMessageDTO,
      );

      return;
    }

    this.logger.error(
      'Error processing notification: ' + createNotificationDTO.mensagemId,
    );

    await this.amqpConnection.publish(
      'notification.exchange',
      'notification_status',
      {
        mensagemId: createNotificationDTO.mensagemId,
        status: ProcessStatus.FAILED,
      } as ProcessedMessageDTO,
    );
  }
}
