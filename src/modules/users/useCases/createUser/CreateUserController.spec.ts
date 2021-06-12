import request from "supertest"
import { app } from "../../../../app"
import { ICreateUserDTO } from "./ICreateUserDTO"
import { Connection, createConnection } from 'typeorm';

let connection: Connection

describe("Create User Integration", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to create a new user", async () => {
    const johnDoe: ICreateUserDTO = {
      name: "John Doe",
      email: "john@gmail.com",
      password: "secret"
    }

    const { status } = await request(app).post("/api/v1/users").send(johnDoe).expect(201)
  })

  it("should not be able to create a new user with email that is already in use", async () => {
    const janeDoe: ICreateUserDTO = {
      name: "Jane Doe",
      email: "jane@gmail.com",
      password: "secret"
    }

    await request(app)
      .post("/api/v1/users")
      .send(janeDoe)
      .expect(201)

    await request(app)
      .post("/api/v1/users")
      .send(janeDoe)
      .expect(400)
  })
})
