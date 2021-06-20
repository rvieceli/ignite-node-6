import request from "supertest";
import { app } from "../../../../app";
import { Connection, createConnection } from "typeorm";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

const johnDoe: ICreateUserDTO = {
  name: "John Doe",
  email: "john.get.statement@gmail.com",
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

describe("Get Balance Suite", () => {
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

  it("should be able to get the a statement", async () => {
    const { body: createdDeposit } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 20,
        description: "Deposit test #1",
      })
      .set({ Authorization })
      .expect(201);

    const { body: createdWithdraw } = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "Withdraw test #1",
      })
      .set({ Authorization })
      .expect(201);

    const { body: createdTransfer } = await request(app)
      .post(`/api/v1/statements/transfers/${janeId}`)
      .send({
        amount: 10,
        description: "Transfer test",
      })
      .set({
        Authorization,
      })
      .expect(201);

    const { body: deposit } = await request(app)
      .get(`/api/v1/statements/${createdDeposit.id}`)
      .set({ Authorization })
      .expect(200);

    expect(deposit).toMatchObject(createdDeposit);

    const { body: withdraw } = await request(app)
      .get(`/api/v1/statements/${createdWithdraw.id}`)
      .set({ Authorization })
      .expect(200);

    expect(withdraw).toMatchObject(createdWithdraw);

    const { body: transfer } = await request(app)
      .get(`/api/v1/statements/${createdTransfer.id}`)
      .set({ Authorization })
      .expect(200);

    expect(transfer).toMatchObject(createdTransfer);
  });

  it("should not be able to get statement that not exists", async () => {
    await request(app)
      .get(`/api/v1/statements/31b2f7d1-6a0b-490a-8b28-50e3c084f905`)
      .set({ Authorization })
      .expect(404);
  });

  it("should not be able to get statement unauthenticated", async () => {
    const { body: createdDeposit } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Deposit test #1",
      })
      .set({ Authorization })
      .expect(201);

    await request(app)
      .get(`/api/v1/statements/${createdDeposit.id}`)
      .expect(401);
  });

  it("should not be able to get statement from another user", async () => {
    const { body: createdDeposit } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Deposit test #1",
      })
      .set({ Authorization })
      .expect(201);

    const {
      body: { token },
    } = await request(app).post("/api/v1/sessions").send({
      email: janeDoe.email,
      password: janeDoe.password,
    });

    await request(app)
      .get(`/api/v1/statements/${createdDeposit.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .expect(404);
  });
});
