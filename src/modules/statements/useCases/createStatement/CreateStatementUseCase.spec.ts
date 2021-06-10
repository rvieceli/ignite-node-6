import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { IStatementsRepository } from "../../repositories/IStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { ICreateStatementDTO } from "./ICreateStatementDTO"

let usersRepository: IUsersRepository
let statementsRepository: IStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "john@gmail.com",
  password: "secret"
}

describe("Create Statement Suite", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
  })

  it("should be able to create a new deposit", async () => {
    const user = await createUserUseCase.execute(johnDoe)
    const user_id = user.id as string

    const deposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test create new deposit"
    }

    const statement = await createStatementUseCase.execute(deposit)

    expect(statement).toHaveProperty("id")
    expect(statement).toMatchObject(deposit)
  })

  it("should be able to create a new withdraw", async () => {
    const user = await createUserUseCase.execute(johnDoe)
    const user_id = user.id as string

    const deposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test create new deposit"
    }

    await createStatementUseCase.execute(deposit)

    const withdraw: ICreateStatementDTO = {
      user_id,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Test create new withdraw"
    }

    const statement = await createStatementUseCase.execute(withdraw)

    expect(statement).toHaveProperty("id")
    expect(statement).toMatchObject(withdraw)
  })

  it("should bot be able to create a new withdraw higher than the balance", async () => {
    expect.hasAssertions()

    const user = await createUserUseCase.execute(johnDoe)
    const user_id = user.id as string

    const deposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test create new deposit"
    }

    await createStatementUseCase.execute(deposit)

    const withdraw: ICreateStatementDTO = {
      user_id,
      type: OperationType.WITHDRAW,
      amount: 101,
      description: "Test create new withdraw"
    }

    try {
      await createStatementUseCase.execute(withdraw)
    } catch (err) {
      expect(err).toBeInstanceOf(CreateStatementError.InsufficientFunds)
    }
  })

  it("should not be able to create a new statement for a user that not exists", async () => {
    expect.hasAssertions()

    const user_id = "not-exists-user-id"

    const deposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test create new statement"
    }

    try {
      await createStatementUseCase.execute(deposit)
    } catch (err) {
      expect(err).toBeInstanceOf(CreateStatementError.UserNotFound)
    }
  })
})
