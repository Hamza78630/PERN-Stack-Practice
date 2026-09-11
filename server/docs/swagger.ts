import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "TechSolve API",
            version: "1.0.0",
            description:
                "API documentation for the TechSolve backend application"
        },

        servers: [
            {
                url: "http://127.0.0.1:3002",
                description: "Local development server"
            }
        ],

        tags: [
            {
                name: "Users",
                description:
                    "User registration, authentication, profiles and administration"
            },
            {
                name: "Products",
                description:
                    "Product creation and product/order operations"
            },
            {
                name: "Payments",
                description:
                    "Stripe payment and checkout operations"
            }
        ],

        components: {

            // ==========================================
            // JWT AUTHENTICATION
            // ==========================================

            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description:
                        "Enter your JWT token as: Bearer <token>"
                }
            },


            // ==========================================
            // COMMON SCHEMAS
            // ==========================================

            schemas: {

                User: {
                    type: "object",

                    properties: {
                        userid: {
                            type: "integer",
                            example: 1
                        },

                        name: {
                            type: "string",
                            example: "Hamza"
                        },

                        email: {
                            type: "string",
                            format: "email",
                            example: "hamza@example.com"
                        },

                        role: {
                            type: "string",
                            enum: [
                                "User",
                                "Admin"
                            ],
                            example: "User"
                        },

                        avatarurl: {
                            type: "string",
                            example:
                                "http://127.0.0.1:3002/uploads/avatars/avatar.jpg"
                        }
                    }
                },


                Product: {
                    type: "object",

                    properties: {
                        productid: {
                            type: "integer",
                            example: 1
                        },

                        name: {
                            type: "string",
                            example: "Premium Support"
                        },

                        description: {
                            type: "string",
                            example:
                                "Technical support package"
                        },

                        price: {
                            type: "integer",
                            example: 2000
                        }
                    }
                },


                Order: {
                    type: "object",

                    properties: {
                        orderid: {
                            type: "integer",
                            example: 1
                        },

                        userid: {
                            type: "integer",
                            example: 1
                        },

                        amount: {
                            type: "integer",
                            example: 2000
                        },

                        currency: {
                            type: "string",
                            example: "usd"
                        },

                        status: {
                            type: "string",
                            example: "pending"
                        },

                        stripesessionid: {
                            type: "string",
                            example:
                                "cs_test_example"
                        }
                    }
                },


                Error: {
                    type: "object",

                    properties: {
                        success: {
                            type: "boolean",
                            example: false
                        },

                        message: {
                            type: "string",
                            example:
                                "Something went wrong"
                        }
                    }
                }
            }
        }
    },

    // Swagger will search these files for
    // @swagger endpoint documentation.
    apis: [
        "./routes/*.ts",
        "./pgRoutes/*.ts"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export {
    swaggerUi,
    swaggerSpec
};