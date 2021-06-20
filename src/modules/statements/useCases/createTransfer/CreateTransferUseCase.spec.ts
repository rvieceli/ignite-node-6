import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

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

describe("Create Statement Suite", () => {
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

  it("should be able to create a new transfer", async () => {
    const sender = await createUserUseCase.execute(johnDoe);
    const user = await createUserUseCase.execute(janeDoe);
    const sender_id = sender.id as string;
    const user_id = user.id as string;

    await createStatementUseCase.execute({
      user_id: sender_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test create new deposit",
    });

    const transfer: ICreateTransferDTO = {
      sender_id,
      user_id,
      amount: 60,
      description: "Test create new transfer",
    };

    const statement = await createTransferUseCase.execute(transfer);

    expect(statement).toHaveProperty("sender_id");
    expect(statement.type).toBe(OperationType.TRANSFER);
    expect(statement).toMatchObject(transfer);

    const senderBalance = await getBalanceUseCase.execute({
      user_id: sender_id,
    });

    expect(senderBalance.balance).toBe(40);

    const receiverBalance = await getBalanceUseCase.execute({
      user_id,
    });

    expect(receiverBalance.balance).toBe(60);
  });

  it("should be able to update balance", async () => {
    const sender = await createUserUseCase.execute(johnDoe);
    const user = await createUserUseCase.execute(janeDoe);
    const sender_id = sender.id as string;
    const user_id = user.id as string;

    await createStatementUseCase.execute({
      user_id: sender_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test create new deposit",
    });

    const transfer: ICreateTransferDTO = {
      sender_id,
      user_id,
      amount: 60,
      description: "Test create new transfer",
    };

    await createTransferUseCase.execute(transfer);

    const senderBalance = await getBalanceUseCase.execute({
      user_id: sender_id,
    });

    expect(senderBalance.balance).toBe(40);

    const receiverBalance = await getBalanceUseCase.execute({
      user_id,
    });

    expect(receiverBalance.balance).toBe(60);
  });

  it("should bot be able to create a new transfer higher than the balance", async () => {
    expect.hasAssertions();

    const sender = await createUserUseCase.execute(johnDoe);
    const user = await createUserUseCase.execute(janeDoe);
    const sender_id = sender.id as string;
    const user_id = user.id as string;

    await createStatementUseCase.execute({
      user_id: sender_id,
      type: OperationType.DEPOSIT,
      amount: 35,
      description: "Test create new deposit",
    });

    try {
      await createTransferUseCase.execute({
        sender_id,
        user_id,
        amount: 60,
        description: "Test create new transfer",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(CreateTransferError.InsufficientFunds);
    }
  });

  it("should not be able to create a new transfer for the same user", async () => {
    expect.hasAssertions();

    const user = await createUserUseCase.execute(janeDoe);
    const user_id = user.id as string;

    try {
      await createTransferUseCase.execute({
        sender_id: user_id,
        user_id,
        amount: 60,
        description: "Test create new transfer",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(CreateTransferError.CannotBeEqual);
    }
  });

  it("should not be able to create a new transfer for the user that not exists", async () => {
    expect.hasAssertions();

    const user = await createUserUseCase.execute(janeDoe);
    const user_id = user.id as string;

    try {
      await createTransferUseCase.execute({
        sender_id: user_id,
        user_id: "user-does-not-exits",
        amount: 60,
        description: "Test create new transfer",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(CreateTransferError.UserNotFound);
    }
  });

  it("should not be able to create a new transfer for the sender user that not exists", async () => {
    expect.hasAssertions();

    const user = await createUserUseCase.execute(janeDoe);
    const user_id = user.id as string;

    try {
      await createTransferUseCase.execute({
        sender_id: "sender-user-does-not-exits",
        user_id,
        amount: 60,
        description: "Test create new transfer",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(CreateTransferError.SenderUserNotFound);
    }
  });
});
