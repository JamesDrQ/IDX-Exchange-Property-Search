const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds,
      baths,
      limit = "20",
      offset = "0",
    } = req.query;

    // URL query parameters are strings by default,
    // so numeric parameters must be converted.
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    const parsedMinPrice =
      minPrice !== undefined ? Number(minPrice) : undefined;

    const parsedMaxPrice =
      maxPrice !== undefined ? Number(maxPrice) : undefined;

    const parsedBeds =
      beds !== undefined ? Number(beds) : undefined;

    const parsedBaths =
      baths !== undefined ? Number(baths) : undefined;

    // -----------------------------
    // 1. Validate pagination
    // -----------------------------

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      return res.status(400).json({
        error: "limit must be an integer between 1 and 100",
      });
    }

    if (
      !Number.isInteger(parsedOffset) ||
      parsedOffset < 0
    ) {
      return res.status(400).json({
        error: "offset must be a non-negative integer",
      });
    }

    // -----------------------------
    // 2. Validate numeric filters
    // -----------------------------

    if (
      minPrice !== undefined &&
      (!Number.isFinite(parsedMinPrice) ||
        parsedMinPrice < 0)
    ) {
      return res.status(400).json({
        error: "minPrice must be a non-negative number",
      });
    }

    if (
      maxPrice !== undefined &&
      (!Number.isFinite(parsedMaxPrice) ||
        parsedMaxPrice < 0)
    ) {
      return res.status(400).json({
        error: "maxPrice must be a non-negative number",
      });
    }

    if (
      beds !== undefined &&
      (!Number.isInteger(parsedBeds) ||
        parsedBeds < 0)
    ) {
      return res.status(400).json({
        error: "beds must be a non-negative integer",
      });
    }

    if (
      baths !== undefined &&
      (!Number.isInteger(parsedBaths) ||
        parsedBaths < 0)
    ) {
      return res.status(400).json({
        error: "baths must be a non-negative integer",
      });
    }

    if (
      parsedMinPrice !== undefined &&
      parsedMaxPrice !== undefined &&
      parsedMinPrice > parsedMaxPrice
    ) {
      return res.status(400).json({
        error: "minPrice cannot be greater than maxPrice",
      });
    }

    // -----------------------------
    // 3. Build SQL conditions
    // -----------------------------

    const conditions = [];
    const values = [];

    if (city !== undefined) {
      const trimmedCity = city.trim();

      if (!trimmedCity) {
        return res.status(400).json({
          error: "city cannot be empty",
        });
      }

      conditions.push(
        "LOWER(TRIM(L_City)) = LOWER(TRIM(?))"
      );
      values.push(trimmedCity);
    }

    if (zipcode !== undefined) {
      const trimmedZipcode = zipcode.trim();

      if (!trimmedZipcode) {
        return res.status(400).json({
          error: "zipcode cannot be empty",
        });
      }

      conditions.push("TRIM(L_Zip) = ?");
      values.push(trimmedZipcode);
    }

    if (parsedMinPrice !== undefined) {
      conditions.push("L_SystemPrice >= ?");
      values.push(parsedMinPrice);
    }

    if (parsedMaxPrice !== undefined) {
      conditions.push("L_SystemPrice <= ?");
      values.push(parsedMaxPrice);
    }

    if (parsedBeds !== undefined) {
      conditions.push("L_Keyword2 >= ?");
      values.push(parsedBeds);
    }

    if (parsedBaths !== undefined) {
      conditions.push("LM_Dec_3 >= ?");
      values.push(parsedBaths);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // -----------------------------
    // 4. Count all matching rows
    // -----------------------------

    const countSql = `
      SELECT COUNT(*) AS total
      FROM rets_property
      ${whereClause}
    `;

    const [countRows] = await pool.query(
      countSql,
      values
    );

    // -----------------------------
    // 5. Fetch one page of results
    // -----------------------------

    const dataSql = `
      SELECT
        L_DisplayId,
        L_Address,
        L_City,
        L_Photos,
        L_State,
        L_Zip,
        L_SystemPrice,
        L_Keyword2 AS bedrooms,
        LM_Dec_3 AS bathrooms,
        LM_Int2_3 AS sqft,
        MainLevelBedrooms,
        BathroomsHalf,
        L_Keyword7
      FROM rets_property
      ${whereClause}
      ORDER BY L_DisplayId
      LIMIT ?
      OFFSET ?
    `;

    const dataValues = [
      ...values,
      parsedLimit,
      parsedOffset,
    ];

    const [rows] = await pool.query(
      dataSql,
      dataValues
    );

    // -----------------------------
    // 6. Send response
    // -----------------------------

    return res.json({
      total: countRows[0].total,
      limit: parsedLimit,
      offset: parsedOffset,
      results: rows,
    });
  } catch (error) {
    console.error(
      "GET /api/properties error:",
      error
    );

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve properties",
    });
  }
});

router.get("/:id/openhouses", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-zA-Z0-9]{1,255}$/.test(id)) {
      return res.status(400).json({
        error: "Invalid property ID",
      });
    }

    const [propertyRows] = await pool.query(
      `
        SELECT L_ListingID
        FROM rets_property
        WHERE L_ListingID = ?
        LIMIT 1
      `,
      [id]
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    const [openHouseRows] = await pool.query(
      `
        SELECT *
        FROM rets_openhouse
        WHERE L_ListingID = ?
        ORDER BY OpenHouseDate, OH_StartTime
      `,
      [id]
    );

    return res.json(openHouseRows);
  } catch (error) {
    console.error(
      "GET /api/properties/:id/openhouses error:",
      error
    );

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve open houses",
    });
  }
});

// GET /api/properties/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-zA-Z0-9]{1,255}$/.test(id)) {
      return res.status(400).json({
        error: "Invalid property ID",
      });
    }

    const [rows] = await pool.query(
      `
        SELECT *
        FROM rets_property
        WHERE L_ListingID = ?
        LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error(
      "GET /api/properties/:id error:",
      error
    );

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve property",
    });
  }
});

module.exports = router;