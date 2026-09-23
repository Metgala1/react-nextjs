export const openapi = {
  openapi: "3.0.3",

  info: {
    title: "StoreFront API",
    version: "1.0.0",
    description: "API documentation for the StoreFront application.",
  },

  components: {
    // =========================================================
    // SCHEMAS
    // =========================================================

    schemas: {
      // ---------------------------------------------------------
      // CATEGORY
      // ---------------------------------------------------------

      Category: {
        type: "object",

        properties: {
          id: {
            type: "integer",
            example: 2,
          },

          name: {
            type: "string",
            example: "Laptops",
          },

          slug: {
            type: "string",
            example: "laptops",
          },
        },

        required: ["id", "name", "slug"],
      },

      // ---------------------------------------------------------
      // PRODUCT
      // ---------------------------------------------------------

      Product: {
        type: "object",

        properties: {
          id: {
            type: "integer",
            example: 1,
          },

          name: {
            type: "string",
            example: "MacBook Air M4",
          },

          price: {
            type: "number",
            example: 1299.99,
          },

          rating: {
            type: "number",
            example: 4.8,
          },

          reviewsCount: {
            type: "integer",
            example: 125,
          },

          description: {
            type: "string",
            example: "A powerful and lightweight laptop.",
          },

          specs: {
            type: "array",

            items: {
              type: "string",
            },

            example: [
              "M4 chip",
              "16GB RAM",
              "512GB SSD",
            ],
          },

          image: {
            type: "string",
            example: "products/macbook-air.jpg",
          },

          quantity: {
            type: "integer",
            example: 10,
          },

          category: {
            $ref: "#/components/schemas/Category",
          },
        },

        required: [
          "id",
          "name",
          "price",
          "rating",
          "reviewsCount",
          "description",
          "specs",
          "image",
          "quantity",
          "category",
        ],
      },

      // ---------------------------------------------------------
      // CREATE PRODUCT INPUT
      // ---------------------------------------------------------

      CreateProductInput: {
        type: "object",

        properties: {
          name: {
            type: "string",
            example: "MacBook Air M4",
          },

          price: {
            type: "number",
            example: 1299.99,
          },

          category: {
            type: "string",
            example: "Laptops",
          },

          rating: {
            type: "number",
            example: 4.8,
          },

          reviewsCount: {
            type: "integer",
            example: 123,
          },

          description: {
            type: "string",
            example: "A powerful and lightweight laptop.",
          },

          specs: {
            type: "array",

            items: {
              type: "string",
            },

            example: [
              "M4 chip",
              "16GB RAM",
              "512GB SSD",
            ],
          },

          image: {
            type: "string",
            example: "products/macbook-air.jpg",
          },

          quantity: {
            type: "integer",
            example: 10,
          },
        },

        required: [
          "name",
          "price",
          "category",
          "rating",
          "reviewsCount",
          "description",
          "specs",
          "image",
          "quantity",
        ],
      },

      // ---------------------------------------------------------
      // UPDATE PRODUCT INPUT
      // ---------------------------------------------------------

      UpdateProductInput: {
        type: "object",

        properties: {
          name: {
            type: "string",
            example: "MacBook Air M4 Updated",
          },

          price: {
            type: "number",
            example: 1099.99,
          },

          category: {
            type: "string",
            example: "Laptops",
          },

          rating: {
            type: "number",
            example: 4.9,
          },

          reviewsCount: {
            type: "integer",
            example: 150,
          },

          description: {
            type: "string",
            example: "Updated product description.",
          },

          specs: {
            type: "array",

            items: {
              type: "string",
            },

            example: [
              "M4 chip",
              "24GB RAM",
              "1TB SSD",
            ],
          },

          image: {
            type: "string",
            example: "products/macbook-air-updated.jpg",
          },

          quantity: {
            type: "integer",
            example: 15,
          },
        },
      },

      // ---------------------------------------------------------
      // SINGLE PRODUCT RESPONSE
      // ---------------------------------------------------------

      ProductResponse: {
        type: "object",

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          data: {
            $ref: "#/components/schemas/Product",
          },
        },

        required: ["success", "data"],
      },

      // ---------------------------------------------------------
      // PRODUCT LIST RESPONSE
      // ---------------------------------------------------------

      ProductListResponse: {
        type: "object",

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          data: {
            type: "object",

            properties: {
              products: {
                type: "array",

                items: {
                  $ref: "#/components/schemas/Product",
                },
              },

              totalPages: {
                type: "integer",
                example: 5,
              },

              currentPage: {
                type: "integer",
                example: 2,
              },
            },

            required: [
              "products",
              "totalPages",
              "currentPage",
            ],
          },
        },

        required: ["success", "data"],
      },

      // ---------------------------------------------------------
      // PRODUCT DELETED RESPONSE
      // ---------------------------------------------------------

      ProductDeletedResponse: {
        type: "object",

        properties: {
          success: {
            type: "boolean",
            example: true,
          },

          data: {
            type: "object",

            properties: {
              message: {
                type: "string",
                example: "Product deleted successfully",
              },

              product: {
                $ref: "#/components/schemas/Product",
              },
            },

            required: ["message", "product"],
          },
        },

        required: ["success", "data"],
      },

      // ---------------------------------------------------------
      // API ERROR
      // ---------------------------------------------------------

      ApiError: {
        type: "object",

        properties: {
          success: {
            type: "boolean",
            example: false,
          },

          error: {
            type: "object",

            properties: {
              message: {
                type: "string",
                example: "Product not found",
              },

              code: {
                type: "string",
                example: "PRODUCT_NOT_FOUND",
              },

              details: {
                type: "object",
                additionalProperties: true,
              },
            },

            required: ["message", "code"],
          },
        },

        required: ["success", "error"],
      },
    },

    // =========================================================
    // REUSABLE RESPONSES
    // =========================================================

    responses: {
      // ---------------------------------------------------------
      // 400 VALIDATION ERROR
      // ---------------------------------------------------------

      ValidationError: {
        description: "Request validation failed.",

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiError",
            },

            example: {
              success: false,

              error: {
                message: "Validation failed",

                code: "VALIDATION_ERROR",

                details: {
                  name: ["Name is required"],
                  price: ["Price must be greater than 0"],
                },
              },
            },
          },
        },
      },

      // ---------------------------------------------------------
      // 400 INVALID PRODUCT ID
      // ---------------------------------------------------------

      InvalidProductId: {
        description: "Invalid product ID.",

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiError",
            },

            example: {
              success: false,

              error: {
                message: "Invalid product ID",
                code: "INVALID_PRODUCT_ID",
              },
            },
          },
        },
      },

      // ---------------------------------------------------------
      // 401 UNAUTHORIZED
      // ---------------------------------------------------------

      Unauthorized: {
        description: "Authentication required.",

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiError",
            },

            example: {
              success: false,

              error: {
                message: "Authentication required",
                code: "UNAUTHENTICATED",
              },
            },
          },
        },
      },

      // ---------------------------------------------------------
      // 403 FORBIDDEN
      // ---------------------------------------------------------

      Forbidden: {
        description: "User does not have permission.",

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiError",
            },

            example: {
              success: false,

              error: {
                message: "Forbidden",
                code: "FORBIDDEN",
              },
            },
          },
        },
      },

      // ---------------------------------------------------------
      // 404 PRODUCT NOT FOUND
      // ---------------------------------------------------------

      ProductNotFound: {
        description: "Product not found.",

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiError",
            },

            example: {
              success: false,

              error: {
                message: "Product not found",
                code: "PRODUCT_NOT_FOUND",
              },
            },
          },
        },
      },

      // ---------------------------------------------------------
      // 500 INTERNAL SERVER ERROR
      // ---------------------------------------------------------

      InternalServerError: {
        description: "Internal server error.",

        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiError",
            },

            example: {
              success: false,

              error: {
                message: "Internal server error",
                code: "INTERNAL_SERVER_ERROR",
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "session",
      },
    },
  },

  // ===========================================================
  // API PATHS
  // ===========================================================

  paths: {
    // =========================================================
    // /api/products
    // =========================================================

    "/api/products": {
      // -------------------------------------------------------
      // GET /api/products
      // -------------------------------------------------------

      get: {
        summary: "Get products",

        description:
          "Returns a paginated list of products with optional search and category filtering.",

        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            description:
              "Search products by name or description.",

            schema: {
              type: "string",
              example: "laptop",
            },
          },

          {
            name: "category",
            in: "query",
            required: false,
            description:
              "Filter products by category name.",

            schema: {
              type: "string",
              example: "Laptops",
            },
          },

          {
            name: "page",
            in: "query",
            required: false,
            description:
              "The page number to retrieve.",

            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 2,
            },
          },
        ],

        responses: {
          "200": {
            description: "Products retrieved successfully.",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductListResponse",
                },
              },
            },
          },

          "500": {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },

      // -------------------------------------------------------
      // POST /api/products
      // -------------------------------------------------------

      post: {
        summary: "Create a product",

        description:
          "Creates a new product. Authentication and products:create permission are required.",
        security: [
          {
            sessionCookie: [],
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateProductInput",
              },
            },
          },
        },

        responses: {
          "201": {
            description: "Product created successfully.",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductResponse",
                },
              },
            },
          },

          "400": {
            $ref: "#/components/responses/ValidationError",
          },

          "401": {
            $ref: "#/components/responses/Unauthorized",
          },

          "403": {
            $ref: "#/components/responses/Forbidden",
          },

          "500": {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
    },

    // =========================================================
    // /api/products/{id}
    // =========================================================

    "/api/products/{id}": {
      // -------------------------------------------------------
      // GET /api/products/{id}
      // -------------------------------------------------------

      get: {
        summary: "Get a product by ID",

        description:
          "Returns a single product using its numeric ID.",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the product.",

            schema: {
              type: "integer",
              minimum: 1,
            },
          },
        ],

        responses: {
          "200": {
            description: "Product retrieved successfully.",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductResponse",
                },
              },
            },
          },

          "400": {
            $ref: "#/components/responses/InvalidProductId",
          },

          "404": {
            $ref: "#/components/responses/ProductNotFound",
          },

          "500": {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },

      // -------------------------------------------------------
      // PATCH /api/products/{id}
      // -------------------------------------------------------

      patch: {
        summary: "Update a product",

        description:
          "Updates an existing product. Authentication and products:update permission are required.",
        security: [
          {
            sessionCookie: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the product.",

            schema: {
              type: "integer",
              minimum: 1,
            },
          },
        ],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateProductInput",
              },
            },
          },
        },

        responses: {
          "200": {
            description: "Product updated successfully.",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductResponse",
                },
              },
            },
          },

          "400": {
            $ref: "#/components/responses/ValidationError",
          },

          "401": {
            $ref: "#/components/responses/Unauthorized",
          },

          "403": {
            $ref: "#/components/responses/Forbidden",
          },

          "404": {
            $ref: "#/components/responses/ProductNotFound",
          },

          "500": {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },

      // -------------------------------------------------------
      // DELETE /api/products/{id}
      // -------------------------------------------------------

      delete: {
        summary: "Delete a product",

        description:
          "Deletes an existing product. Authentication and products:delete permission are required.",
        security: [
          {
            sessionCookie: [],
          },
        ],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the product.",

            schema: {
              type: "integer",
              minimum: 1,
            },
          },
        ],

        responses: {
          "200": {
            description: "Product deleted successfully.",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductDeletedResponse",
                },
              },
            },
          },

          "400": {
            $ref: "#/components/responses/InvalidProductId",
          },

          "401": {
            $ref: "#/components/responses/Unauthorized",
          },

          "403": {
            $ref: "#/components/responses/Forbidden",
          },

          "404": {
            $ref: "#/components/responses/ProductNotFound",
          },

          "500": {
            $ref: "#/components/responses/InternalServerError",
          },
        },
      },
    },
  },
} as const;
