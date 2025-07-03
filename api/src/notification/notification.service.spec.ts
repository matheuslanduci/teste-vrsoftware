import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { NotificationService } from './notification.service';
import { createMock } from '@golevelup/ts-jest';
import { CreateNotificationDTO } from './dto/create-notification.dto';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    const amqpConnection = createMock<AmqpConnection>({});

    notificationService = new NotificationService(amqpConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should call amqpConnection.publish with correct parameters', async () => {
      const createNotificationDTO: CreateNotificationDTO = {
        mensagemId: '123',
        conteudoMensagem: 'Test message',
      };

      jest
        .spyOn(notificationService['amqpConnection'], 'publish')
        .mockResolvedValue(true);

      await notificationService.send(createNotificationDTO);

      expect(
        notificationService['amqpConnection'].publish,
      ).toHaveBeenCalledWith(
        'notification.exchange',
        'notification_created',
        createNotificationDTO,
      );
    });

    it('should throw an error if amqpConnection.publish fails', async () => {
      const createNotificationDTO: CreateNotificationDTO = {
        mensagemId: '123',
        conteudoMensagem: 'Test message',
      };

      jest
        .spyOn(notificationService['amqpConnection'], 'publish')
        .mockResolvedValue(false);

      await expect(
        notificationService.send(createNotificationDTO),
      ).rejects.toThrow('Failed to send notification');
    });
  });

  describe('processNotification', () => {
    it('should process notification and publish status', async () => {
      jest
        .spyOn(notificationService, 'generateRandomNumber')
        .mockReturnValue(3);

      const createNotificationDTO: CreateNotificationDTO = {
        mensagemId: '123',
        conteudoMensagem: 'Test message',
      };

      jest
        .spyOn(notificationService['amqpConnection'], 'publish')
        .mockResolvedValue(true);

      await notificationService.processNotification(createNotificationDTO);

      expect(
        notificationService['amqpConnection'].publish,
      ).toHaveBeenCalledWith(
        'notification.exchange',
        'notification_status',
        expect.objectContaining({
          mensagemId: createNotificationDTO.mensagemId,
          status: 'PROCESSADO_SUCESSO',
        }),
      );
    });

    it('should handle error during notification processing', async () => {
      jest
        .spyOn(notificationService, 'generateRandomNumber')
        .mockReturnValue(1);

      const createNotificationDTO: CreateNotificationDTO = {
        mensagemId: '123',
        conteudoMensagem: 'Test message',
      };

      jest
        .spyOn(notificationService['amqpConnection'], 'publish')
        .mockResolvedValue(true);

      await notificationService.processNotification(createNotificationDTO);

      expect(
        notificationService['amqpConnection'].publish,
      ).toHaveBeenCalledWith(
        'notification.exchange',
        'notification_status',
        expect.objectContaining({
          mensagemId: createNotificationDTO.mensagemId,
          status: 'FALHA_PROCESSAMENTO',
        }),
      );
    });
  });
});
