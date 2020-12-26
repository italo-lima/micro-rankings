export interface IGame {
  category: string;
  challenge: string;
  players: string[];
  def: string;
  result: Array<IResult>
}

export interface IResult {
  set: string;
}