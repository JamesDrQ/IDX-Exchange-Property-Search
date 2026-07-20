// Read .env, ensure the safety of key sensitive data
require("dotenv").config(); 
// Load Express that helps create backend server. Name it 'express'.
const express = require("express");
// Load cors. It is used to control which frontend websites can send 
// requests to backend.
const cors = require("cors");
// Load database connection pool. (db.js)
const pool = require("./db");
// Load properties.js
const propertiesRouter = require("./routes/properties");
// Create the Express object, which works as the server itself.
const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
});

// Routes
app.use("/api/properties", propertiesRouter);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});