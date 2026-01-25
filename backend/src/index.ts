import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middleware/errorHandler";
// import { notFoundHandler } from "./middleware/notFoundHandler";
import logger from "./utils/logger";
import { API_VERSION } from "./config/swagger";
import { generatePostmanCollection } from "./config/docs";
import { swaggerSpec } from "./config/docs";
import router from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".rentals.co.ke") ||
        allowedOrigins.includes("*")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Raw OpenAPI JSON
app.get("/docs/openapi.json", (_, res) => {
  res.json(swaggerSpec);
});
app.get("/docs/postman.json", async (_, res, next) => {
  try {
    const collection = await generatePostmanCollection();
    res.json(collection);
  } catch (err) {
    next(err);
  }
});
// @ts-ignore
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Alternative: simpler routing approach
app.use(`/api/${API_VERSION}`, router);
// app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(
    `📚 Swagger docs: http://localhost:${PORT}/api/${API_VERSION}/docs`,
  );
  logger.info(
    `📮 Postman collection: http://localhost:${PORT}/api/${API_VERSION}/docs/postman.json`,
  );
});

export default app;
