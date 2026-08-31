const express = require("express");
const request = require("supertest");

// Replace the real database pool with a mock so tests do not
// depend on a running MySQL database.
jest.mock("../db", () => ({
  query: jest.fn(),
}));

const pool = require("../db");
const propertiesRouter = require("./properties");

const app = express();

app.use(express.json());
app.use("/api/properties", propertiesRouter);

describe("GET /api/properties", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns properties successfully", async () => {
    const mockProperty = {
      L_DisplayId: "123456",
      L_Address: "123 Test Street",
      L_City: "San Diego",
      L_State: "CA",
      L_Zip: "92101",
      L_SystemPrice: 750000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1500,
    };

    // First database query returns the total matching property count.
    pool.query.mockResolvedValueOnce([
      [{ total: 1 }],
    ]);

    // Second database query returns the current page of properties.
    pool.query.mockResolvedValueOnce([
      [mockProperty],
    ]);

    const response = await request(app)
      .get("/api/properties")
      .expect(200);

    expect(response.body).toEqual({
      total: 1,
      limit: 20,
      offset: 0,
      results: [mockProperty],
    });

    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test("uses the requested limit and offset for pagination", async () => {
    pool.query.mockResolvedValueOnce([
        [{ total: 50 }],
    ]);

    pool.query.mockResolvedValueOnce([
        [],
    ]);

    const response = await request(app)
        .get("/api/properties?limit=10&offset=20")
        .expect(200);

    expect(response.body).toEqual({
        total: 50,
        limit: 10,
        offset: 20,
        results: [],
    });

    expect(pool.query).toHaveBeenCalledTimes(2);

    // The second query fetches the actual page of results,
    // so limit and offset should be its final two parameters.
    const dataQueryValues = pool.query.mock.calls[1][1];

    expect(dataQueryValues).toEqual([10, 20]);
  });

  test("applies property filters to the database query", async () => {
    pool.query.mockResolvedValueOnce([
        [{ total: 5 }],
    ]);

    pool.query.mockResolvedValueOnce([
        [],
    ]);

    const response = await request(app)
        .get(
        "/api/properties?city=San%20Diego&zipcode=92101&minPrice=500000&maxPrice=1000000&beds=3&baths=2"
        )
        .expect(200);

    expect(response.body).toEqual({
        total: 5,
        limit: 20,
        offset: 0,
        results: [],
    });

    expect(pool.query).toHaveBeenCalledTimes(2);

    const countSql = pool.query.mock.calls[0][0];
    const countValues = pool.query.mock.calls[0][1];

    expect(countSql).toContain(
        "LOWER(TRIM(L_City)) = LOWER(TRIM(?))"
    );
    expect(countSql).toContain("TRIM(L_Zip) = ?");
    expect(countSql).toContain("L_SystemPrice >= ?");
    expect(countSql).toContain("L_SystemPrice <= ?");
    expect(countSql).toContain("L_Keyword2 >= ?");
    expect(countSql).toContain("LM_Dec_3 >= ?");

    expect(countValues).toEqual([
        "San Diego",
        "92101",
        500000,
        1000000,
        3,
        2,
    ]);

    const dataValues = pool.query.mock.calls[1][1];

    expect(dataValues).toEqual([
        "San Diego",
        "92101",
        500000,
        1000000,
        3,
        2,
        20,
        0,
    ]);
  });

  test.each([
    ["/api/properties?limit=0", "limit must be an integer between 1 and 100"],
    ["/api/properties?limit=101", "limit must be an integer between 1 and 100"],
    ["/api/properties?limit=abc", "limit must be an integer between 1 and 100"],
    ["/api/properties?offset=-1", "offset must be a non-negative integer"],
    ["/api/properties?minPrice=-1", "minPrice must be a non-negative number"],
    ["/api/properties?maxPrice=abc", "maxPrice must be a non-negative number"],
    ["/api/properties?beds=-1", "beds must be a non-negative integer"],
    ["/api/properties?baths=1.5", "baths must be a non-negative integer"],
    [
        "/api/properties?minPrice=900000&maxPrice=500000",
        "minPrice cannot be greater than maxPrice",
    ],
    ["/api/properties?sortBy=invalid", "Invalid sortBy value"],
    [
        "/api/properties?sortOrder=random",
        "sortOrder must be asc or desc",
    ],
    ["/api/properties?city=%20", "city cannot be empty"],
    ["/api/properties?zipcode=%20", "zipcode cannot be empty"],
  ])("returns 400 for invalid query: %s", async (url, expectedError) => {
    const response = await request(app)
        .get(url)
        .expect(400);

    expect(response.body).toEqual({
        error: expectedError,
    });

    // Invalid requests should be rejected before querying MySQL.
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("applies sorting to the property query", async () => {
    pool.query.mockResolvedValueOnce([
        [{ total: 2 }],
    ]);

    pool.query.mockResolvedValueOnce([
        [],
    ]);

    await request(app)
        .get("/api/properties?sortBy=L_SystemPrice&sortOrder=desc")
        .expect(200);

    expect(pool.query).toHaveBeenCalledTimes(2);

    const dataSql = pool.query.mock.calls[1][0];

    expect(dataSql).toContain(
        "ORDER BY L_SystemPrice DESC"
    );

    const dataValues = pool.query.mock.calls[1][1];

    expect(dataValues).toEqual([20, 0]);
  });
});

describe("GET /api/properties/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns a property successfully", async () => {
    const mockProperty = {
      L_ListingID: "1174572339",
      L_Address: "2003 Lynbrook Avenue",
      L_City: "Hacienda Heights",
      L_State: "CA",
      L_SystemPrice: 950000,
    };

    pool.query.mockResolvedValueOnce([
      [mockProperty],
    ]);

    const response = await request(app)
      .get("/api/properties/1174572339")
      .expect(200);

    expect(response.body).toEqual(mockProperty);

    expect(pool.query).toHaveBeenCalledTimes(1);

    expect(pool.query.mock.calls[0][1]).toEqual([
      "1174572339",
    ]);
  });

  test("returns 404 when the property does not exist", async () => {
    pool.query.mockResolvedValueOnce([
      [],
    ]);

    const response = await request(app)
      .get("/api/properties/9999999999")
      .expect(404);

    expect(response.body).toEqual({
      error: "Property not found",
    });
  });

  test("returns 400 for an invalid property ID", async () => {
    const response = await request(app)
      .get("/api/properties/abc!")
      .expect(400);

    expect(response.body).toEqual({
      error: "Invalid property ID",
    });

    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe("GET /api/properties/:id/openhouses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns open houses successfully", async () => {
    const mockOpenHouses = [
      {
        L_ListingID: "1174572339",
        OpenHouseDate: "2026-06-20",
        OH_StartTime: "14:00:00",
        OH_EndTime: "16:00:00",
      },
    ];

    // First query verifies that the property exists.
    pool.query.mockResolvedValueOnce([
      [{ L_ListingID: "1174572339" }],
    ]);

    // Second query returns the property's open houses.
    pool.query.mockResolvedValueOnce([
      mockOpenHouses,
    ]);

    const response = await request(app)
      .get("/api/properties/1174572339/openhouses")
      .expect(200);

    expect(response.body).toEqual(mockOpenHouses);

    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test("returns an empty array when the property has no open houses", async () => {
    pool.query.mockResolvedValueOnce([
      [{ L_ListingID: "1174572339" }],
    ]);

    pool.query.mockResolvedValueOnce([
      [],
    ]);

    const response = await request(app)
      .get("/api/properties/1174572339/openhouses")
      .expect(200);

    expect(response.body).toEqual([]);
  });

  test("returns 404 when the property does not exist", async () => {
    pool.query.mockResolvedValueOnce([
      [],
    ]);

    const response = await request(app)
      .get("/api/properties/9999999999/openhouses")
      .expect(404);

    expect(response.body).toEqual({
      error: "Property not found",
    });

    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test("returns 400 for an invalid property ID", async () => {
    const response = await request(app)
      .get("/api/properties/abc!/openhouses")
      .expect(400);

    expect(response.body).toEqual({
      error: "Invalid property ID",
    });

    expect(pool.query).not.toHaveBeenCalled();
  });
});