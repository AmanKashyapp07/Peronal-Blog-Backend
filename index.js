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
    origin: "http://localhost:5173", // You can also move this to process.env.CLIENT_URL if you like
  })
);

// Mount routes
app.use("/api", routes);

// Global error handler (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});