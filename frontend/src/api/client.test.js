import { getProperties } from "./client";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test("fetches properties without filters", async () => {
  const mockData = {
    total: 2,
    results: [{ id: 1 }, { id: 2 }],
  };

  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => mockData,
  });

  const result = await getProperties();

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:5000/api/properties?"
  );

  expect(result).toEqual(mockData);
});

test("adds filters to the request URL", async () => {
  const mockData = {
    total: 1,
    results: [{ id: 1 }],
  };

  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => mockData,
  });

  await getProperties({
    city: "San Diego",
    beds: "3",
  });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:5000/api/properties?city=San+Diego&beds=3"
  );
});

test("throws an error when the request fails", async () => {
  global.fetch.mockResolvedValue({
    ok: false,
  });

  await expect(getProperties()).rejects.toThrow(
    "Failed to fetch properties"
  );
});