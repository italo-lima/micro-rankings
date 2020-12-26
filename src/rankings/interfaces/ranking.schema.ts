import {Types, Document} from "mongoose"
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({timestamps: true, collection: 'rankings'})
export class Ranking{

  @Prop({type:Types.ObjectId})
  challenge: string;
  
  @Prop({type:Types.ObjectId})
  player: string;

  @Prop({type:Types.ObjectId})
  game: string;

  @Prop({type:Types.ObjectId})
  category: string;

  @Prop({type:Types.ObjectId})
  event: string;

  @Prop()
  operation: string;
  
  @Prop()
  points: number;
}

export type RankingDocument = Ranking & Document

export const RankingSchema = SchemaFactory.createForClass(Ranking)