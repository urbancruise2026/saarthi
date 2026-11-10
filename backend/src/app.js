import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import registerRoutes from "./routes/index.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, "../public");
const frontendIndex = path.join(frontendDist, "index.html");

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:4000",
      "https://trinetra.urbancruise.org",
      "https://saarthi.urbancruise.org",
      "https://pinaak.urbancruise.org",
      "https://urbancruise.in",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ─── API ─────────────────────────────────────────────────────────────────────
registerRoutes(app);

app.get("/health", (req, res) => {
  res.send("🚀 Server started successfully");
});

// Unknown API URLs return JSON 404 (not the React page).
app.use("/api", (req, res) => {
  res
    .status(404)
    .json({
      success: false,
      message: `API route not found: ${req.originalUrl}`,
    });
});

// ─── Frontend (built React app in backend/public) ────────────────────────────
if (fs.existsSync(frontendIndex)) {
  // Vite file names in /assets contain a hash, so they can be cached for a long time.
  app.use(
    "/assets",
    express.static(path.join(frontendDist, "assets"), {
      maxAge: "1y",
      immutable: true,
    }),
  );

  // Other files (logo, robots.txt, ...). index.html is never cached,
  // so users always get the latest version after a new build.
  app.use(
    express.static(frontendDist, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html"))
          res.setHeader("Cache-Control", "no-cache");
      },
    }),
  );

  // Any other page URL (e.g. /leave, /attendance) → React app handles routing.
  app.get(/^\/(?!api\/|socket\.io\/).*/, (req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(frontendIndex);
  });
} else {
  console.warn(
    `[frontend] ${frontendIndex} not found — run "npm run build" in backend`,
  );
  app.get(/^\/(?!api\/|socket\.io\/).*/, (req, res) => {
    res
      .status(503)
      .send(
        'Frontend build not found. Run "npm run build" in the backend folder.',
      );
  });
}

app.use(errorMiddleware);

export { app };
