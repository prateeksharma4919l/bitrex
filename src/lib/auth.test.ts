import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth";

describe("password hashing", () => {
  it("stores a hash instead of the supplied password and verifies it", async () => {
    const password = randomBytes(24).toString("base64url");
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword(`${password}wrong`, hash)).resolves.toBe(false);
  });
});
