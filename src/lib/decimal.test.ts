import { describe, it, expect } from "vitest";
import { decimalAdd, decimalSubtract } from "./decimal";
describe("fixed point decimal helpers", () => {
  it("adds without floating point rounding", () =>
    expect(decimalAdd("0.1", "0.2")).toBe("0.3"));
  it("keeps precision for token quantities", () =>
    expect(decimalAdd("1.000000000000000001", "0.000000000000000009")).toBe(
      "1.00000000000000001",
    ));
  it("subtracts exactly", () =>
    expect(decimalSubtract("10", "0.125")).toBe("9.875"));
});
