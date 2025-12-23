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
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Handle preflight requests
app.options("*", cors());

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
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});