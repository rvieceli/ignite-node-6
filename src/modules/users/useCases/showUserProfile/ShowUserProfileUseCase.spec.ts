import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "john@gmail.com",
  password: "secret"
}

describe("Show User Profile Suite", () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
  })

  it("should be able to show user profile", async () => {
    const user = await createUserUseCase.execute(johnDoe)
    const user_id = user.id as string

    const profile = await showUserProfileUseCase.execute(user_id)

    expect(profile).toMatchObject(user)
  })

  it("should not be able to show user profile from user that not exists", async () => {
    expect.hasAssertions()

    try {
      await showUserProfileUseCase.execute("not-exists-user-id")
    } catch (err) {
      expect(err).toBeInstanceOf(ShowUserProfileError)
    }

  })
})
