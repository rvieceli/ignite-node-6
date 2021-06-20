import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateTransferUseCase } from "../createTransfer/CreateTransferUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createTransferUseCase: CreateTransferUseCase;
let getBalanceUseCase: GetBalanceUseCase;

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "john@gmail.com",
  password: "secret",
};

const janeDoe: ICreateUserDTO = {
  name: "Jane Doe",
  email: "jane@gmail.com",
  password: "secret",
};

describe("Get Balance Suite", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    createTransferUseCase = new CreateTransferUseCase(
      usersRepository,
      statementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should be able to get the balance", async () => {
    const user = await createUserUseCase.execute(johnDoe);
    const user_id = user.id as string;

    const statements: ICreateStatementDTO[] = [
      {
        user_id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Deposit",
      },
      {
        user_id,
        type: OperationType.WITHDRAW,
        amount: 35,
        description: "Withdraw",
      },
      {
        user_id,
        type: OperationType.WITHDRAW,
        amount: 55,
        description: "Withdraw 2",
      },
    ];

    await Promise.all(
      statements.map((statement) => createStatementUseCase.execute(statement))
    );

    const balance = await getBalanceUseCase.execute({ user_id });

    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toBe(10);
    expect(balance.statement).toHaveLength(3);
  });

  it("should be able to get zero balance for a user that don't have statements", async () => {
    const user = await createUserUseCase.execute(johnDoe);
    const user_id = user.id as string;

    const balance = await getBalanceUseCase.execute({ user_id });

    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toBe(0);
    expect(balance.statement).toHaveLength(0);
  });

  it("should be able to get balance for a transfer statement", async () => {
    const user = await createUserUseCase.execute(johnDoe);
    const user_id = user.id as string;
    const receiver = await createUserUseCase.execute(janeDoe);
    const receiver_id = receiver.id as string;

    const deposit = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test create new deposit",
    });

    const transfer = await createTransferUseCase.execute({
      sender_id: user_id,
      user_id: receiver_id,
      amount: 60,
      description: "Test create new transfer",
    });

    const senderBalance = await getBalanceUseCase.execute({
      user_id,
    });

    expect(senderBalance.balance).toBe(40);
    expect(senderBalance.statement).toHaveLength(2);
    expect(senderBalance.statement).toMatchObject([deposit, transfer]);

    const receiverBalance = await getBalanceUseCase.execute({
      user_id: receiver_id,
    });

    expect(receiverBalance.balance).toBe(60);
    expect(receiverBalance.statement).toHaveLength(1);
    expect(receiverBalance.statement).toMatchObject([transfer]);
  });

  it("should not be able to get balance for a user that not exists", async () => {
    expect.hasAssertions();

    const user_id = "not-exists-user-id";

    try {
      await getBalanceUseCase.execute({ user_id });
    } catch (err) {
      expect(err).toBeInstanceOf(GetBalanceError);
    }
  });
});
