import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"

let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase

describe("Create User Suite", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it("should be able to create a new user", async () => {

    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@gmail.com",
      password: "secret"
    })

    expect(user).toHaveProperty("id")
    expect(user.email).toBe("john@gmail.com")
    expect(user.password).not.toBe("secret")

  })

  it("should not be able to create a new user with email that is already in use", async () => {
    expect.hasAssertions()

    await createUserUseCase.execute({
      name: "John Doe",
      email: "john@gmail.com",
      password: "secret"
    })

    try {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "john@gmail.com",
        password: "secret"
      })
    } catch (err) {
      expect(err).toBeInstanceOf(CreateUserError)
    }

  })
})
