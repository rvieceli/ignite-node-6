import { ValueTransformer } from "typeorm";

class ColumnNumericTransformer implements ValueTransformer {
  from(value: string): number {
    return Number(value);
  }
  to(value: number): number {
    return value;
  }
}

export { ColumnNumericTransformer };
