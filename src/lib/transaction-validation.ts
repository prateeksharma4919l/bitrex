import { z } from "zod";

/** The browser submits decimal text. Server operations never parse authority amounts through Number. */
export const moneyRequestSchema = z.object({
  type: z.enum(["BUY", "SELL", "WITHDRAWAL", "SWAP"]),
  asset: z.string().regex(/^[A-Z0-9]{2,12}$/),
  network: z.string().min(2).max(48),
  amount: z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/),
  idempotencyKey: z.string().uuid(),
});
