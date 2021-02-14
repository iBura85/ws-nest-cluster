import { MyWebSocket } from './MyWebScoket';

export class SocketClients {
  static list: Record<string, MyWebSocket> = {};
}
