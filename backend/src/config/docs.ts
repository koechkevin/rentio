import swaggerJsdoc from "swagger-jsdoc";

// openapi-to-postmanv2 has no TS types, use require + any
// eslint-disable-next-line @typescript-eslint/no-var-requires
const openapiToPostman: any = require("openapi-to-postmanv2");

const apiVersion = process.env.API_VERSION || "v1";
const port = process.env.PORT || 5556;
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Property SAAS API",
    version: "1.0.0",
    description:
      "REST API documentation for Property SAAS backend (auth, users, posts).",
  },
  servers: [
    {
      url: `${serverUrl}/api/${apiVersion}`,
      description: "Main API server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

const swaggerOptions = {
  definition: swaggerDefinition,
  // You can add JSDoc @openapi comments in these files to enrich the spec
  apis: ["./src/routes/**/*.ts", "./src/controllers/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

let cachedPostman: any | null = null;

export const generatePostmanCollection = async (): Promise<any> => {
  if (cachedPostman) {
    return cachedPostman;
  }

  return new Promise((resolve, reject) => {
    openapiToPostman.convert(
      {
        type: "json",
        data: swaggerSpec,
      },
      {
        folderStrategy: "tags",
      },
      (err: Error | null, result: any) => {
        if (err || !result?.result) {
          return reject(
            err || new Error("Failed to convert OpenAPI to Postman"),
          );
        }
        cachedPostman = result.output[0].data;
        return resolve(cachedPostman);
      },
    );
  });
};
