import swaggerJsdoc from "swagger-jsdoc";

const API_VERSION = process.env.API_VERSION || "v1";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Property SaaS API",
      version: API_VERSION,
      description: "API documentation for Property Management SaaS",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5556}/api/${API_VERSION}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.routes.ts", "./src/controllers/**/*.controller.ts"],
};

export const specs = swaggerJsdoc(options);
export { API_VERSION };
