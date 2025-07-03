import { IsEnum, IsUUID } from 'class-validator';

export enum ProcessStatus {
  SUCCESS = 'PROCESSADO_SUCESSO',
  FAILED = 'FALHA_PROCESSAMENTO',
}

export class ProcessedMessageDTO {
  @IsUUID()
  mensagemId: string;

  @IsEnum(ProcessStatus)
  status: ProcessStatus;
}
