import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationHandler } from './notification.handler';

const rabbitmqUri =
  process.env.RABBITMQ_URI ||
  `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: rabbitmqUri,
      connectionInitOptions: { wait: false },
      exchanges: [
        {
          name: 'notification.exchange',
          type: 'direct',
          options: {
            durable: true,
          },
        },
      ],
      queues: [
        {
          name: process.env.RABBITMQ_ENTRY_QUEUE || 'notification.entry',
          exchange: 'notification.exchange',
          routingKey: 'notification_created',
          options: {
            durable: true,
          },
        },
        {
          name: process.env.RABBITMQ_STATUS_QUEUE || 'notification.status',
          exchange: 'notification.exchange',
          routingKey: 'notification_status',
          options: {
            durable: true,
          },
        },
      ],
    }),
  ],
  providers: [NotificationService, NotificationGateway, NotificationHandler],
  controllers: [NotificationController],
})
export class NotificationModule {}
