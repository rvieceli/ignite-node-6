import { OperationType } from "../../entities/Statement";

export interface ICreateStatementDTO {
  user_id: string;
  description: string;
  amount: number;
  type: OperationType;
  sender_id?: string;
}
