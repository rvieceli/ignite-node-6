import request from "supertest";
import { app } from "../../../../app";
import { Connection, createConnection } from "typeorm";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "create.statement.john@gmail.com",
  password: "secret",
};

const janeDoe: ICreateUserDTO = {
  name: "Jane Doe",
  email: "create.statement.jane@gmail.com",
  password: "secret",
};

let connection: Connection;
let Authorization: string;
let janeId: string;

describe("Create Transfer Integration", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(johnDoe);
    await request(app).post("/api/v1/users").send(janeDoe);

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: johnDoe.email,
      password: johnDoe.password,
    });

    Authorization = `Bearer ${token}`;

    const {
      body: {
        user: { id },
      },
    } = await request(app).post("/api/v1/sessions").send({
      email: janeDoe.email,
      password: janeDoe.password,
    });

    janeId = id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new transfer", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 50,
        description: "Deposit for transfer test",
      })
      .set({
        Authorization,
      })
      .expect(201);
    await request(app)
      .post(`/api/v1/statements/transfers/${janeId}`)
      .send({
        amount: 10,
        description: "Transfer test",
      })
      .set({
        Authorization,
      })
      .expect(201);
  });

  // it("should be able to create a new withdraw", async () => {
  //   await request(app)
  //     .post("/api/v1/statements/deposit")
  //     .send({
  //       amount: 50,
  //       description: "Deposit for withdraw test",
  //     })
  //     .set({
  //       Authorization,
  //     })
  //     .expect(201);

  //   await request(app)
  //     .post("/api/v1/statements/withdraw")
  //     .send({
  //       amount: 50,
  //       description: "Withdraw with balance test",
  //     })
  //     .set({
  //       Authorization,
  //     })
  //     .expect(201);
  // });

  // it("should not be able to create a new withdraw higher than the balance", async () => {
  //   const { body: balance } = await request(app)
  //     .get("/api/v1/statements/balance")
  //     .set({ Authorization });

  //   await request(app)
  //     .post("/api/v1/statements/withdraw")
  //     .send({
  //       amount: balance.balance + 0.01,
  //       description: "Withdraw without balance test",
  //     })
  //     .set({
  //       Authorization,
  //     })
  //     .expect(400);
  // });

  // it("should not be able to create a new statement unauthenticated", async () => {
  //   await request(app)
  //     .post("/api/v1/statements/deposit")
  //     .send({
  //       amount: 100,
  //       description: "Deposit unauthenticated",
  //     })
  //     .expect(401);

  //   await request(app)
  //     .post("/api/v1/statements/withdraw")
  //     .send({
  //       amount: 100,
  //       description: "Withdraw unauthenticated",
  //     })
  //     .expect(401);
  // });
});
