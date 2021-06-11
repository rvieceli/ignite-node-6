import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { IStatementsRepository } from "../../repositories/IStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let usersRepository: IUsersRepository
let statementsRepository: IStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "john@gmail.com",
  password: "secret"
}


describe("Get Balance Suite", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
  })

  it("should be able to get the a statement", async() => {
    const user = await createUserUseCase.execute(johnDoe)
    const user_id = user.id as string

    const deposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test create new deposit"
    }

    const { id } = await createStatementUseCase.execute(deposit)
    const statement_id = id as string

    const statement = await getStatementOperationUseCase.execute({ user_id, statement_id })

    expect(statement).toHaveProperty("id")
    expect(statement).toMatchObject(deposit)
  })


  it("should not be able to get statement for a user that not exists", async () => {
    expect.hasAssertions()

    const user_id = "not-exists-user-id"
    const statement_id = 'do-not-care'

    try {
      await getStatementOperationUseCase.execute({ user_id, statement_id })
    } catch (err) {
      expect(err).toBeInstanceOf(GetStatementOperationError.UserNotFound)
    }
  })

  it("should not be able to get statement that not exists", async () => {
    expect.hasAssertions()

    const user = await createUserUseCase.execute(johnDoe)
    const user_id = user.id as string

    const statement_id = 'not-exists-statement-id'

    try {
      await getStatementOperationUseCase.execute({ user_id, statement_id })
    } catch (err) {
      expect(err).toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    }
  })
})
