import { ChallengeStatus } from '../challenge-status.enum';

export interface IChallenge {
  _id: string;
  dateHourChallenge: Date;
  status: ChallengeStatus;
  dateHourRequester: Date;
  dateHourResponse?: Date;
  requester: string;
  category: string;
  game?: string;
  players: string[];
}
