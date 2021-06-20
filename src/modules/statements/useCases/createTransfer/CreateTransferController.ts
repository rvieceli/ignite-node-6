import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const sender_id = request.user.id;
    const { user_id } = request.params;
    const { amount, description } = request.body;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const statement = createTransferUseCase.execute({
      sender_id,
      user_id,
      amount,
      description,
    });

    return response.status(201).json(statement);
  }
}

export { CreateTransferController };
