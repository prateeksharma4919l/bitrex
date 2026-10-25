import { describe, expect, it } from "vitest";
import { moneyRequestSchema } from "./transaction-validation";

describe("money request validation", () => {
  it("accepts exact decimal strings and UUID idempotency keys", () => {
    expect(
      moneyRequestSchema.safeParse({
        type: "WITHDRAWAL",
        asset: "USDT",
        network: "Tron",
        amount: "0.00000001",
        idempotencyKey: "2c10b6c4-8b5b-4ebd-9383-e8cf4c730676",
      }).success,
    ).toBe(true);
  });
  it("rejects imprecise, negative, malformed, or non-idempotent input", () => {
    for (const amount of ["-1", "01.2", "0.1234567890123456789", "1e3"]) {
      expect(
        moneyRequestSchema.safeParse({
          type: "BUY",
          asset: "BTC",
          network: "Bitcoin",
          amount,
          idempotencyKey: "invalid-key",
        }).success,
      ).toBe(false);
    }
  });
});
