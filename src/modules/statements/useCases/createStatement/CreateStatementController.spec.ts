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

describe("Create Statement Integration", () => {
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

  it("should be able to create a new deposit", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Deposit test",
      })
      .set({
        Authorization,
      })
      .expect(201);
  });

  it("should be able to create a new withdraw", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit for withdraw test",
      })
      .set({
        Authorization,
      })
      .expect(201);

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Withdraw with balance test",
      })
      .set({
        Authorization,
      })
      .expect(201);
  });

  it("should not be able to create a new withdraw higher than the balance", async () => {
    const { body: balance } = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: balance.balance + 0.01,
        description: "Withdraw without balance test",
      })
      .set({
        Authorization,
      })
      .expect(400);
  });

  it("should not be able to create a new statement unauthenticated", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit unauthenticated",
      })
      .expect(401);

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Withdraw unauthenticated",
      })
      .expect(401);
  });
});
