import { Injectable, Logger } from '@nestjs/common';
import { IGame } from './interfaces/game.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RankingDocument, Ranking } from './interfaces/ranking.schema';
import { RpcException } from '@nestjs/microservices';
import { ClientProxySmartRanking } from 'src/proxyrmq/client.proxy';
import { ICategory } from './interfaces/category.interface';
import { EventName } from './event.name.enum';
import {
  IRankingResponse,
  IHistory,
} from './interfaces/ranking-response.interface';
import { IChallenge } from './interfaces/challenges.interface';
import * as lodash from 'lodash';
import * as momentTimezone from 'moment-timezone';

@Injectable()
export class RankingsService {
  constructor(
    @InjectModel(Ranking.name)
    private readonly challengeRanking: Model<RankingDocument>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(RankingsService.name);

  private clientAdminBackend = this.clientProxySmartRanking.getClientProxyAdminBackendInstance();
  private clientChallengesBackend = this.clientProxySmartRanking.getClientProxyChallengesInstance();

  async gameProcessing(idGame: string, game: IGame): Promise<void> {
    this.logger.log(`IdGame ${idGame} game: ${JSON.stringify(game)}`);

    try {
      const category: ICategory = await this.clientAdminBackend
        .send('get-categories', game.category)
        .toPromise();

      await Promise.all(
        game.players.map(async player => {
          const ranking = new this.challengeRanking();

          ranking.category = game.category;
          ranking.challenge = game.challenge;
          ranking.game = idGame;
          ranking.player = player;

          if (player === game.def) {
            this.logger.log(`category ${JSON.stringify(category)}`);
            const eventFilter = category.events.filter(
              event => event.name == EventName.VICTORY,
            );
            this.logger.log(`eventFilter ${JSON.stringify(eventFilter[0])}`);
            ranking.event = EventName.VICTORY;
            ranking.points = eventFilter[0].value;
            ranking.operation = eventFilter[0].operation;
          } else {
            const eventFilter = category.events.filter(
              event => event.name == EventName.DEFEAT,
            );

            ranking.event = EventName.DEFEAT;
            ranking.points = eventFilter[0].value;
            ranking.operation = eventFilter[0].operation;
          }

          this.logger.log(`ranking ${JSON.stringify(ranking)}`);
          await ranking.save();
        }),
      );
    } catch (error) {
      this.logger.error(`error: ${error}`);
      throw new RpcException(error.message);
    }
  }

  async ranking(
    idCategory: any,
    dateRef: string,
  ): Promise<IRankingResponse[] | IRankingResponse> {
    try {
      this.logger.log(`idCategory: ${idCategory} dateRef: ${dateRef}`);

      if (!dateRef) {
        dateRef = momentTimezone()
          .tz('America/SaolodashPaulo')
          .format('YYYY-MM-DD');
        this.logger.log(`dateRef: ${dateRef}`);
      }

      const registresRanking = await this.challengeRanking
        .find()
        .where('category')
        .equals(idCategory);

      const challenges: IChallenge[] = await this.clientChallengesBackend
        .send('get-challenges-accommplished', {
          idCategory: idCategory,
          dateRef: dateRef,
        })
        .toPromise();
      this.logger.log(
        `antes registresRanking: ${JSON.stringify(registresRanking)}`,
      );
      this.logger.log(`challenges: ${JSON.stringify(challenges)}`);

      lodash.remove(registresRanking, function(item) {
        return (
          challenges.filter(challenge => challenge._id == item.challenge)
            .length == 0
        );
      });

      this.logger.log(`registresRanking: ${JSON.stringify(registresRanking)}`);

      const result = lodash(registresRanking)
        .groupBy('player')
        .map((items, key) => ({
          player: key,
          history: lodash.countBy(items, 'event'),
          points: lodash.sumBy(items, 'points'),
        }))
        .value();

      this.logger.log(`result: ${JSON.stringify(result)}`);

      const orderedResult = lodash.orderBy(result, 'points', 'desc');

      const rankingResponseList: IRankingResponse[] = [];

      orderedResult.map((item, index) => {
        const rankingResponse: IRankingResponse = {};

        rankingResponse.player = item.player;
        rankingResponse.position = index + 1;
        rankingResponse.punctuation = item.points;

        const historic: IHistory = {};

        historic.wins = item.history.VICTORY || 0;
        historic.defeats = item.history.DEFEAT || 0;
        rankingResponse.historyGames = historic;

        rankingResponseList.push(rankingResponse);
      });

      return rankingResponseList;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
