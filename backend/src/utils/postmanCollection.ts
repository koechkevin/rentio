import { API_VERSION } from "../config/swagger";

const BASE_URL = `{{BASE_URL}}/api/${API_VERSION}`;

export const generatePostmanCollection = () => {
  return {
    info: {
      name: "Property SaaS API",
      version: API_VERSION,
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: [
      {
        name: "Auth",
        item: [
          {
            name: "Register",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    email: "user@example.com",
                    password: "password123",
                    firstName: "John",
                    lastName: "Doe",
                  },
                  null,
                  2,
                ),
              },
              url: {
                raw: `${BASE_URL}/auth/register`,
                protocol: "http",
                host: ["{{HOST}}"],
                path: ["api", API_VERSION, "auth", "register"],
              },
            },
          },
          {
            name: "Login",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  { email: "user@example.com", password: "password123" },
                  null,
                  2,
                ),
              },
              url: {
                raw: `${BASE_URL}/auth/login`,
                protocol: "http",
                host: ["{{HOST}}"],
                path: ["api", API_VERSION, "auth", "login"],
              },
            },
          },
        ],
      },
      {
        name: "Tenant",
        item: [
          {
            name: "Get Current Lease",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{TOKEN}}",
                  type: "text",
                },
              ],
              url: {
                raw: `${BASE_URL}/tenant/lease`,
                protocol: "http",
                host: ["{{HOST}}"],
                path: ["api", API_VERSION, "tenant", "lease"],
              },
            },
          },
          {
            name: "Initiate Payment",
            request: {
              method: "POST",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{TOKEN}}",
                  type: "text",
                },
                { key: "Content-Type", value: "application/json" },
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ amount: 5000 }, null, 2),
              },
              url: {
                raw: `${BASE_URL}/tenant/payments/initiate`,
                protocol: "http",
                host: ["{{HOST}}"],
                path: ["api", API_VERSION, "tenant", "payments", "initiate"],
              },
            },
          },
          {
            name: "Get Payments",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{TOKEN}}",
                  type: "text",
                },
              ],
              url: {
                raw: `${BASE_URL}/tenant/payments`,
                protocol: "http",
                host: ["{{HOST}}"],
                path: ["api", API_VERSION, "tenant", "payments"],
              },
            },
          },
          {
            name: "Create Issue",
            request: {
              method: "POST",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{TOKEN}}",
                  type: "text",
                },
                { key: "Content-Type", value: "application/json" },
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    title: "Broken window",
                    description: "Living room window is broken",
                    priority: "HIGH",
                  },
                  null,
                  2,
                ),
              },
              url: {
                raw: `${BASE_URL}/tenant/issues`,
                protocol: "http",
                host: ["{{HOST}}"],
                path: ["api", API_VERSION, "tenant", "issues"],
              },
            },
          },
          {
            name: "Get Issues",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{TOKEN}}",
                  type: "text",
                },
              ],
              url: {
                raw: `${BASE_URL}/tenant/issues`,
                protocol: "http",
                host: ["{{HOST}}"],
                path: ["api", API_VERSION, "tenant", "issues"],
              },
            },
          },
        ],
      },
      {
        name: "Owner",
        item: [
          {
            name: "Get Properties",
            request: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{TOKEN}}",
                  type: "text",
                },
              ],
              url: {
                raw: `${BASE_URL}/owner/properties`,
                protocol: "http",
                host: ["{{HOST}}"],
                path: ["api", API_VERSION, "owner", "properties"],
              },
            },
          },
        ],
      },
    ],
    variable: [
      {
        key: "BASE_URL",
        value: "http://localhost:3000",
      },
      {
        key: "HOST",
        value: "localhost:3000",
      },
      {
        key: "TOKEN",
        value: "",
      },
    ],
  };
};
