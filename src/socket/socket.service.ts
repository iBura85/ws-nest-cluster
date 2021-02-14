import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClient } from 'redis';
import { SocketClients } from './socket-clients.service';

@Injectable()
export class SocketService implements OnModuleInit, OnModuleDestroy {
  /**
   * Идентификатор сервиса
   */
  private serviceId: string;

  /**
   * Redis клиент для обновления служебного ключа
   */
  public redisClient: RedisClient;

  /**
   * Redis клиент для распространения сообщений
   */
  public publisherClient: RedisClient;

  /**
   * Redis клиент для подписки на сообщения
   */
  private subscriberClient: RedisClient;

  /**
   *
   */
  private discoveryInterval: NodeJS.Timeout;

  /**
   * Необходимо в конструкторе назначить идентифкатор сервису
   * @param socketGateway
   */
  constructor() {
    // именование сервиса
    this.serviceId = 'SOCKET_CHANNEL_' + String(process.pid);
  }

  async onModuleInit() {
    // создать Redis клиентов
    this.redisClient = await this.newRedisClient();
    this.publisherClient = await this.newRedisClient();
    this.subscriberClient = await this.newRedisClient();

    this.subscriberClient.subscribe(this.serviceId);

    this.subscriberClient.on('message', (channel: string, message: string) => {
      this.sendMessage(message, true);
    });

    await this.channelDiscovery();
  }

  sendMessage(message: string, fromRedisChannel = false) {
    for (const id in SocketClients.list) {
      const socketClient = SocketClients.list[id];
      socketClient.send(message);
    }

    if (!fromRedisChannel) {
      this.redisClient.keys('SOCKET_CHANNEL_*', (err: Error, ids: string[]) => {
        ids
          .filter((p) => p != this.serviceId)
          .forEach((id) => {
            this.publisherClient.publish(id, message);
          });
      });
    }
  }

  /**
   * Создание нового клиента Redis
   */
  private async newRedisClient() {
    return createClient({
      host: 'localhost',
      port: 6379,
    });
  }

  private async channelDiscovery() {
    // console.log(this.serviceId + ' channelDiscovery');

    this.redisClient.setex(this.serviceId, 3, Date.now().toString());
    this.discoveryInterval = setTimeout(() => {
      this.channelDiscovery();
    }, 2000);
  }

  async onModuleDestroy() {
    this.discoveryInterval && clearTimeout(this.discoveryInterval);
  }
}
