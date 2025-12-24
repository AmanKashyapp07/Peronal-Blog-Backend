require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

/* =========================
   CORS CONFIG (MUST BE FIRST)
   ========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://personal-blog-frontend-tau.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // IMPORTANT: do NOT throw error
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);



/* =========================
   MIDDLEWARES
   ========================= */
app.use(express.json());

/* =========================
   ROUTES
   ========================= */
app.use("/api", routes);

/* =========================
   ERROR HANDLER (LAST)
   ========================= */
app.use(errorMiddleware);

/* =========================
   SERVER START
   ========================= */
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});

