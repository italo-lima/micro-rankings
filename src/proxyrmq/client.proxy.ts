import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientProxySmartRanking {
  constructor(private configService: ConfigService) {}

  getClientProxyAdminBackendInstance(): ClientProxy {
    const user = this.configService.get('RABBITMQ_USER');
    const password = this.configService.get('RABBITMQ_PASSWORD');
    const url = this.configService.get('RABBITMQ_URL');

    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${user}:${password}@${url}`],
        queue: 'admin-backend',
      },
    });
  }

  getClientProxyChallengesInstance(): ClientProxy {
    const user = this.configService.get('RABBITMQ_USER');
    const password = this.configService.get('RABBITMQ_PASSWORD');
    const url = this.configService.get('RABBITMQ_URL');

    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${user}:${password}@${url}`],
        queue: 'challenges',
      },
    });
  }
}
