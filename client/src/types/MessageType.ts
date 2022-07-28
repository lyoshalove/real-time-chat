export interface IMessage {
  id: string | number;
  message: string;
  username?: string;
  event?: string;
}