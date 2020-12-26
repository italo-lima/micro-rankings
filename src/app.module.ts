import { Module } from '@nestjs/common';
import { RankingsModule } from './rankings/rankings.module';
import {ConfigModule} from "@nestjs/config"
import {MongooseModule} from "@nestjs/mongoose"
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      'mongodb+srv://italo:italo@cluster0.gpcne.mongodb.net/srranking?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    ),
    RankingsModule,
    ProxyrmqModule
  ],
})
export class AppModule {}
