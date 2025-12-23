const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// Parse incoming JSON
app.use(express.json());

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Mount routes (you will define routes later)
app.use("/api", routes);

// Global error handler (must be last)
app.use(errorMiddleware);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});