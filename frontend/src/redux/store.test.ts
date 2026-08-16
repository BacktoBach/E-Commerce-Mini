import { describe, expect, it } from "vitest";
import { baseApi } from "../services/api";
import { store } from "./store";

describe("Redux store", () => {
  it("registers the NightFood API state", () => {
    expect(store.getState()).toHaveProperty(baseApi.reducerPath);
  });

  it("can reset the API cache", () => {
    expect(() => store.dispatch(baseApi.util.resetApiState())).not.toThrow();
  });
});
