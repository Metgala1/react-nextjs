export const openapi = {
  openapi: "3.0.3",

  info: {
    title: "StoreFront API",
    version: "1.0.0",
    description: "API documentation for the StoreFront application.",
  },

  components: {
    schemas: {
      // ========================================
      // CATEGORY
      // ========================================
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

      // ========================================
      // PRODUCT
      // ========================================
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

      // ========================================
      // CREATE PRODUCT INPUT
      // ========================================
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
            example: "Laptop",
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

      // ========================================
      // PRODUCT RESPONSE
      // ========================================
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

      // ========================================
      // API ERROR
      // ========================================
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
  },

  paths: {
    // ========================================
    // GET /api/products/{id}
    // ========================================
    "/api/products/{id}": {
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
          // 200
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

          // 400
          "400": {
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

          // 404
          "404": {
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

          // 500
          "500": {
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
      },
    },

    // ========================================
    // /api/products
    // ========================================
    "/api/products": {
      // ======================================
      // POST /api/products
      // ======================================
      post: {
        summary: "Create a product",

        description:
          "Creates a new product. Authentication and products:create permission are required.",

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
          // 201
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

          // 400
          "400": {
            description: "Validation failed.",

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

          // 401
          "401": {
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

          // 403
          "403": {
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

          // 500
          "500": {
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
      },
    },
  },
} as const;
