export interface ICategory {
  readonly _id: string;
  readonly category: string;
  description: string;
  events: Array<IEvent>
}

interface IEvent {
  name: string;
  operation: string;
  value: number;
}