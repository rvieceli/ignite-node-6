import request from "supertest";
import { app } from "../../../../app";
import { Connection, createConnection } from "typeorm";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "create.statement@gmail.com",
  password: "secret",
};

let connection: Connection;
let Authorization: string;

describe("Get Balance Integration", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(johnDoe);

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: johnDoe.email,
      password: johnDoe.password,
    });

    Authorization = `Bearer ${token}`;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Deposit test #1",
      })
      .set({ Authorization })
      .expect(201);

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit test #2",
      })
      .set({ Authorization })
      .expect(201);

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 30,
        description: "withdraw test",
      })
      .set({ Authorization })
      .expect(201);

    const { status, body } = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization });

    expect(status).toBe(200);
    expect(body).toHaveProperty("balance");
    expect(body.balance).toBe(30);
    expect(body.statement).toHaveLength(3);
  });

  it("should not be able to get balance unauthenticated", async () => {
    await request(app).get("/api/v1/statements/balance").expect(401);
  });
});
