import { Brackets, getRepository, Repository } from "typeorm";

import { OperationType, Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create(data: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create(data);

    return this.repository.save(statement);
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository
      .createQueryBuilder()
      .where("id = :statement_id", { statement_id })
      .andWhere(
        new Brackets((qb) => {
          qb.where({ user_id }).orWhere("sender_id = :user_id", { user_id });
        })
      )
      .getOne();
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statement = await this.repository
      .createQueryBuilder()
      .where({ user_id })
      .orWhere("sender_id = :user_id", { user_id })
      .getMany();

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === OperationType.DEPOSIT) {
        return acc + operation.amount;
      } else if (operation.type === OperationType.WITHDRAW) {
        return acc - operation.amount;
      }

      if (operation.sender_id === user_id) {
        return acc - operation.amount;
      } else {
        return acc + operation.amount;
      }
    }, 0);

    if (with_statement) {
      return {
        statement,
        balance,
      };
    }

    return { balance };
  }
}
