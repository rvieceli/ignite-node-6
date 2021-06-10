import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"
import { ICreateUserDTO } from "./ICreateUserDTO"

let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "john@gmail.com",
  password: "secret"
}

describe("Create User Suite", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it("should be able to create a new user", async () => {

    const user = await createUserUseCase.execute(johnDoe)

    expect(user).toHaveProperty("id")
    expect(user.email).toBe("john@gmail.com")
    expect(user.password).not.toBe("secret")

  })

  it("should not be able to create a new user with email that is already in use", async () => {
    expect.hasAssertions()

    await createUserUseCase.execute(johnDoe)

    try {
      await createUserUseCase.execute(johnDoe)
    } catch (err) {
      expect(err).toBeInstanceOf(CreateUserError)
    }

  })
})
