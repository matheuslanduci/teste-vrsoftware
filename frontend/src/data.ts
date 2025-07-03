export enum ProcessStatus {
  SUCCESS = 'PROCESSADO_SUCESSO',
  FAILED = 'FALHA_PROCESSAMENTO',
  PENDING = 'PENDENTE_PROCESSAMENTO', // only on client
}

export type MessageNotification = {
  mensagemId: string;
  conteudoMensagem: string;
  status: ProcessStatus;
};
