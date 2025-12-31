require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const routes = require("./routes");
const authMiddleware = require("./middleware/auth.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://amankashyap.site",
  "https://www.amankashyap.site"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/api", routes);

app.get("/api/test-auth", authMiddleware, (req, res) => {
  res.json({ ok: true, user: req.user });
});

app.use(errorMiddleware);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});