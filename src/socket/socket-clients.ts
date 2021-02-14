import { MyWebSocket } from './types';

export class SocketClients {
  static list: Record<string, MyWebSocket> = {};
}
