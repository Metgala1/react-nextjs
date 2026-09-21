export const openapi = {
  openapi: "3.0.3",

  info: {
    title: "StoreFront API",
    version: "1.0.0",
    description: "API documentation for the StoreFront application.",
  },

  paths: {
    "/api/products/{id}": {
      get: {
        summary: "Get a product by ID",
        description: "Returns a single product using its numeric ID.",

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
                  type: "object",

                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },

                    data: {
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
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          "400": {
            description: "Invalid product ID.",

            content: {
              "application/json": {
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

          "404": {
            description: "Product not found.",

            content: {
              "application/json": {
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

          "500": {
            description: "Internal server error.",

            content: {
              "application/json": {
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