import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDTO {
  @IsUUID()
  mensagemId: string;

  @IsString()
  @IsNotEmpty()
  conteudoMensagem: string;
}
