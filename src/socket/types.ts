import * as WebSocket from 'ws';

/**
 * Класс WebSocket с добавлением идентификатора
 */
export class MyWebSocket extends WebSocket {
  id: string;
}
