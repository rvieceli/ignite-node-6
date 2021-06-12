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

describe("Authentication User Integration", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    await request(app)
      .post("/api/v1/users")
      .send(johnDoe)
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to create a new user", async () => {
    const { status, body } = await request(app).post("/api/v1/sessions").send({
      email: johnDoe.email,
      password: johnDoe.password,
    })

    expect(status).toBe(200)
    expect(body).toHaveProperty("token")
    expect(body.user.email).toBe(johnDoe.email)
  })

  it("should not be able to authenticate user with wrong email", async () => {
    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: `wrong_email_${johnDoe.email}`,
        password: johnDoe.password,
      })
      .expect(401)
  })

  it("should not be able to authenticate user with wrong password", async () => {
    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: johnDoe.email,
        password: `wrong_email_${johnDoe.password}`,
      })
      .expect(401)
  })

})
