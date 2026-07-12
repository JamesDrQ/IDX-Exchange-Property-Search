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

    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {
      return res.status(400).json({
        error: "limit must be an integer between 1 and 100",
      });
    }

    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        error: "offset must be a non-negative integer",
      });
    }

    const filters = [];
    const values = [];

    if (city !== undefined) {
      filters.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
      values.push(city);
    }

    if (zipcode !== undefined) {
      filters.push("L_Zip = ?");
      values.push(zipcode);
    }

    if (minPrice !== undefined) {
      const n = Number(minPrice);

      if (!Number.isFinite(n) || n < 0) {
        return res.status(400).json({
          error: "minPrice must be a non-negative number",
        });
      }

      filters.push("L_SystemPrice >= ?");
      values.push(n);
    }

    if (maxPrice !== undefined) {
      const n = Number(maxPrice);

      if (!Number.isFinite(n) || n < 0) {
        return res.status(400).json({
          error: "maxPrice must be a non-negative number",
        });
      }

      filters.push("L_SystemPrice <= ?");
      values.push(n);
    }

    if (beds !== undefined) {
      const n = Number(beds);

      if (!Number.isInteger(n) || n < 0) {
        return res.status(400).json({
          error: "beds must be a non-negative integer",
        });
      }

      filters.push("L_Keyword2 >= ?");
      values.push(n);
    }

    if (baths !== undefined) {
      const n = Number(baths);

      if (!Number.isInteger(n) || n < 0) {
        return res.status(400).json({
          error: "baths must be a non-negative integer",
        });
      }

      filters.push("BathroomsHalf >= ?");
      values.push(n);
    }

    const whereClause = filters.length
      ? `WHERE ${filters.join(" AND ")}`
      : "";

    const countSql = `
      SELECT COUNT(*) AS total
      FROM rets_property
      ${whereClause}
    `;

    const dataSql = `
      SELECT
        id,
        L_ListingID,
        L_DisplayId,
        L_Address,
        L_AddressStreet,
        L_City,
        L_State,
        L_Zip,
        L_SystemPrice,
        L_Keyword2,
        BathroomsHalf,
        LM_Int2_3,
        L_Status,
        StandardStatus,
        L_Remarks,
        L_Photos,
        PhotoCount,
        LMD_MP_Latitude,
        LMD_MP_Longitude,
        YearBuilt,
        ModificationTimestamp
      FROM rets_property
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    const [countRows] = await pool.query(countSql, values);
    const [rows] = await pool.query(dataSql, [
      ...values,
      parsedLimit,
      parsedOffset,
    ]);

    res.json({
      total: countRows[0].total,
      limit: parsedLimit,
      offset: parsedOffset,
      results: rows,
    });
  } catch (err) {
    console.error("GET /api/properties error:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;