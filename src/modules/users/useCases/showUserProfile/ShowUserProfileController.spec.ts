import request from "supertest"
import { app } from "../../../../app"
import { Connection, createConnection } from 'typeorm';
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "john@gmail.com",
  password: "secret"
}

let connection: Connection

describe("Show User Profile Integration", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to show user profile", async () => {
    await request(app)
      .post("/api/v1/users")
      .send(johnDoe)

    const { body: { token } } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: johnDoe.email,
        password: johnDoe.password,
      })

    const {status, body } = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(status).toBe(200)
    expect(body.name).toBe(johnDoe.name)
    expect(body.email).toBe(johnDoe.email)
  })

  it("should not be able to show user profile without authentication", async () => {
    await request(app)
      .get("/api/v1/profile")
      .expect(401)
  })
})
