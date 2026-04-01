import { describe, it, expect } from "vitest";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Test the same validation schema used in the register action
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

describe("Registration validation", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password with exactly 7 characters", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("accepts password with exactly 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });
});

describe("Password hashing", () => {
  it("hashes and verifies passwords correctly", async () => {
    const password = "testPassword123";
    const hash = await bcrypt.hash(password, 12);

    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare("wrongPassword", hash)).toBe(false);
  });

  it("produces different hashes for the same password", async () => {
    const password = "testPassword123";
    const hash1 = await bcrypt.hash(password, 12);
    const hash2 = await bcrypt.hash(password, 12);

    expect(hash1).not.toBe(hash2);
    // But both verify correctly
    expect(await bcrypt.compare(password, hash1)).toBe(true);
    expect(await bcrypt.compare(password, hash2)).toBe(true);
  });
});
