import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found", 404);
    }
  }

  export class SenderUserNotFound extends AppError {
    constructor() {
      super("Sender user not found", 404);
    }
  }

  export class CannotBeEqual extends AppError {
    constructor() {
      super("Sender and Receiver cannot be the same user", 400);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }
}
