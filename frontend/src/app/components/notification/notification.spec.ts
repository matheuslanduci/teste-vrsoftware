import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, BehaviorSubject } from 'rxjs';

import { Notification as NotificationComponent } from './notification';
import { Notification as NotificationService } from '../../services/notification';
import { MessageNotification, ProcessStatus } from '../../../data';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let mockNotificationsSubject: BehaviorSubject<MessageNotification[]>;

  beforeEach(async () => {
    mockNotificationsSubject = new BehaviorSubject<MessageNotification[]>([]);

    const notificationServiceSpy = jasmine.createSpyObj(
      'NotificationService',
      [
        'sendNotification',
        'getWebSocketConnectionStatus',
        'reconnectWebSocket',
        'clearNotifications',
      ],
      {
        notifications$: mockNotificationsSubject.asObservable(),
      }
    );

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [NotificationComponent, BrowserAnimationsModule],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture.detectChanges();
  });

  it('deve chamar sendNotification com a mensagem correta', () => {
    const testMessage = 'Teste mensagem';
    notificationService.sendNotification.and.returnValue(
      of({
        mensagemId: 'test-id',
        conteudoMensagem: testMessage,
        status: ProcessStatus.PENDING,
      })
    );

    component.message = testMessage;
    component.onSendMessage();

    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      testMessage
    );
  });

  it('deve fazer requisição POST através do serviço', () => {
    const testMessage = 'Teste POST';
    notificationService.sendNotification.and.returnValue(
      of({
        mensagemId: 'post-id',
        conteudoMensagem: testMessage,
        status: ProcessStatus.PENDING,
      })
    );

    component.message = testMessage;

    expect(component.isLoading).toBeFalse();
    component.onSendMessage();

    expect(notificationService.sendNotification).toHaveBeenCalled();
  });

  it('deve adicionar notificação com status PENDING na lista', () => {
    const mockNotification: MessageNotification = {
      mensagemId: 'pending-id',
      conteudoMensagem: 'Teste PENDING',
      status: ProcessStatus.PENDING,
    };

    mockNotificationsSubject.next([mockNotification]);
    fixture.detectChanges();

    expect(component.messages.length).toBe(1);
    expect(component.messages[0].status).toBe(ProcessStatus.PENDING);
    expect(component.messages[0].mensagemId).toBe('pending-id');
  });
});
