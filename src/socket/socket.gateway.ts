import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import * as WebSocket from 'ws';
import { v4 } from 'uuid';
import { MyWebSocket } from './MyWebScoket';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection {
  // ассоциативный массив содержит сокет для определнного id
  connectedSockets: Record<string, MyWebSocket> = {};

  handleConnection(client: MyWebSocket, req: any) {
    // const baseURL = 'ws://' + req.headers.host + '/';
    // const wsUrl = new url.URL(req.url, baseURL);

    // console.log(wsUrl.searchParams.entries);

    const message = `Connected to PID ${process.pid}`;

    client.id = v4();

    this.connectedSockets[client.id] = client;

    client.send(message);
  }

  @SubscribeMessage('chat')
  chat(client: MyWebSocket, data: { message: string }) {
    this.sendBroadcast(client, data.message);
  }

  // отправить сообщение всем кроме автора
  private sendBroadcast(sourceClient: MyWebSocket, message: string) {
    for (const id in this.connectedSockets) {
      if (sourceClient.id !== id) {
        this.connectedSockets[id].send(message);
      }
    }
  }
}
