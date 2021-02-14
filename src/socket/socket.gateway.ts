import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { v4 } from 'uuid';
import { MyWebSocket } from './types';
import { SocketService } from './socket.service';
import { SocketClients } from './socket-clients';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection {
  // ассоциативный массив содержит сокет для определнного id
  // connectedSockets: Record<string, MyWebSocket> = {};

  constructor(private socketService: SocketService) {}

  handleConnection(client: MyWebSocket, req: any) {
    // const baseURL = 'ws://' + req.headers.host + '/';
    // const wsUrl = new url.URL(req.url, baseURL);

    // console.log(wsUrl.searchParams.entries);

    const message = `Connected to PID ${process.pid}`;

    client.id = v4();

    SocketClients.list[client.id] = client;
    // connectedSockets[client.id] = client;

    client.send(message);
  }

  @SubscribeMessage('chat')
  chat(client: MyWebSocket, data: { message: string }) {
    this.socketService.sendMessage(data.message);
  }
}
