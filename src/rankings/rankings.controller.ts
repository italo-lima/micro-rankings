import { Controller, Logger } from '@nestjs/common';
import {
  Payload,
  Ctx,
  RmqContext,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { IGame } from './interfaces/game.interface';
import { RankingsService } from './rankings.service';
import { IRankingResponse } from './interfaces/ranking-response.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  private readonly logger = new Logger(RankingsController.name);

  @EventPattern('game-processing')
  async gameProcessing(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const orginalMsg = context.getMessage();

    try {
      this.logger.log(`data: ${JSON.stringify(data)}`);
      const idGame: string = data.idGame;
      const game: IGame = data.game;

      await this.rankingsService.gameProcessing(idGame, game);
      await channel.ack(orginalMsg);
    } catch (error) {
      const filterAckError = ackErrors.filter(ackError =>
        error.message.includes(ackError),
      );
      if (filterAckError.length > 0) {
        await channel.ack(orginalMsg);
      }
    }
  }

  @MessagePattern('get-rankings')
  async getRankings(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<IRankingResponse[] | IRankingResponse> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const { idCategory, dateRef } = data;
      return await this.rankingsService.ranking(idCategory, dateRef);
    } finally {
      await channel.ack(originalMsg);
    }
  }
}
