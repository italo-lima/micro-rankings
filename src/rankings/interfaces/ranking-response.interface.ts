export interface IRankingResponse {
  player?: string;
  position?: number;
  punctuation?: number;
  historyGames?: IHistory;
}

export interface IHistory {
  wins?: number;
  defeats?: number;
}
