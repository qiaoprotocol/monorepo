import { go } from "../src/deploy/litActionCode";
import fetchMock from "jest-fetch-mock";

beforeEach(() => {
  fetchMock.resetMocks();
});

test("should handle authenticated user", async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      user: {
        role: "authenticated",
      },
    })
  );

  // Mocking the LitActions.signEcdsa method
  const mockSignEcdsa = jest.fn();
  (global as any).LitActions = {
    signEcdsa: mockSignEcdsa,
  };

  await go();

  expect(mockSignEcdsa).toHaveBeenCalled();
});

test("should handle non-authenticated user", async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      user: {
        role: "guest",
      },
    })
  );

  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  await go();

  expect(consoleSpy).toHaveBeenCalledWith("JWT token and userId do not match");
});

test("should handle fetch error", async () => {
  fetchMock.mockRejectOnce(new Error("API error"));

  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  await go();

  expect(consoleSpy).toHaveBeenCalledWith("API error");
});
