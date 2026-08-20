import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authFlowStorage } from "./authFlowStorage";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
}

describe("authFlowStorage", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores a normalized pending OTP email only for the current tab", () => {
    authFlowStorage.start("signup", " Customer@Example.COM ", 1_000);

    expect(authFlowStorage.get("signup")).toEqual({
      email: "customer@example.com",
      sentAt: 1_000
    });
  });

  it("accepts a recent recovery verification and removes an expired one", () => {
    authFlowStorage.markRecoveryVerified(10_000);

    expect(authFlowStorage.hasValidRecovery(20_000)).toBe(true);
    expect(authFlowStorage.hasValidRecovery(1_000_001)).toBe(false);
    expect(authFlowStorage.hasValidRecovery(20_000)).toBe(false);
  });
});
