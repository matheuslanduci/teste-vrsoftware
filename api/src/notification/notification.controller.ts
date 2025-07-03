import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';
import { notificationData } from '../data';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(202)
  async createNotification(
    @Body() createNotificationDTO: CreateNotificationDTO,
  ) {
    if (notificationData.get(createNotificationDTO.mensagemId)) {
      throw new ConflictException();
    }

    await this.notificationService.send(createNotificationDTO);

    return createNotificationDTO;
  }
}
