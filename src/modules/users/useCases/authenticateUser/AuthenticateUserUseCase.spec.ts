import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"


let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "john@gmail.com",
  password: "secret"
}

describe("Authentication User Suite", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  })

  it("should be able to authenticate user receiving jwt token", async () => {

    const user = await createUserUseCase.execute(johnDoe)

    const authentication = await authenticateUserUseCase.execute({
      email: johnDoe.email,
      password: johnDoe.password,
    })

    expect(authentication).toHaveProperty("token")
    expect(authentication.user).toMatchObject(user)

  })
})
