import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Voty API',
            version: '1.0.0',
            description: 'API documentation for Voty (poll & response system)',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                // === Users ===
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b1234abc...' },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                RegisterUserInput: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        password: { type: 'string', example: 'password123' },
                    }
                },
                LoginUserInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'john@example.com' },
                        password: { type: 'string', example: 'password123' },
                    }
                },
                UpdateNameInput: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Jane Doe' },
                    },
                },
                UpdateEmailInput: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', example: 'new@example.com' },
                    },
                },
                UpdatePasswordInput: {
                    type: 'object',
                    required: ['oldPassword', 'newPassword'],
                    properties: {
                        oldPassword: { type: 'string', example: 'oldpass123' },
                        newPassword: { type: 'string', example: 'newpass456' },
                    },
                },
                DeleteAccountInput: {
                    type: 'object',
                    required: ['password'],
                    properties: {
                        password: { type: 'string', example: 'password123' },
                    },
                },

                // === Polls ===
                Poll: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b1234abc...' },
                        name: { type: 'string', example: 'Customer Feedback' },
                        description: { type: 'string', example: 'Survey for customer opinions' },
                        creator: { $ref: '#/components/schemas/User' },
                        questions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string', example: '64b1234abc...' },
                                    title: { type: 'string', example: 'What do you think of our product?' },
                                    type: { type: 'string', enum: ['open', 'multiple_choice'] },
                                    options: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        example: ['Yes', 'No', 'Maybe'],
                                    },
                                },
                            },
                        },
                        status: { type: 'string', example: 'opened' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreatePollInput: {
                    type: 'object',
                    required: ['name', 'questions'],
                    properties: {
                        name: { type: 'string', example: 'My First Poll' },
                        description: { type: 'string', example: 'A poll for testing' },
                        questions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['title', 'type'],
                                properties: {
                                    title: { type: 'string', example: 'Question 1' },
                                    type: { type: 'string', enum: ['open', 'multiple_choice'] },
                                    options: { type: 'array', items: { type: 'string' } }
                                }
                            }
                        }
                    }
                },
                UpdatePollInput: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Updated Poll' },
                        description: { type: 'string', example: 'Updated description' },
                        questions: { $ref: '#/components/schemas/CreatePollInput/properties/questions' },
                        status: { type: 'string', enum: ['opened', 'closed'] },
                    },
                },

                // === Responses ===
                Response: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64b1234abc...' },
                        poll_id: { type: 'string', example: '64b1234abc...' },
                        user_id: { $ref: '#/components/schemas/User' },
                        answers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question_id: { type: 'string', example: '64b1234abc...' },
                                    answer: { type: 'string', example: 'Yes' },
                                },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                SubmitResponseInput: {
                    type: 'object',
                    required: ['answers'],
                    properties: {
                        answers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['question_id', 'answer'],
                                properties: {
                                    question_id: { type: 'string', example: '64b1234abc...' },
                                    answer: { type: 'string', example: 'Yes' },
                                },
                            },
                        },
                    },
                },
                UpdateResponseInput: {
                    $ref: '#/components/schemas/SubmitResponseInput',
                },

                // === Stats ===
                PollStats: {
                    type: 'object',
                    properties: {
                        totalResponses: { type: 'integer', example: 42 },
                        questions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string' },
                                    title: { type: 'string' },
                                    type: { type: 'string' },
                                    total: { type: 'integer' },
                                    stats: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                option: { type: 'string' },
                                                count: { type: 'integer' },
                                            },
                                        },
                                    },
                                    topAnswers: { type: 'array', items: { type: 'string' } },
                                    responses: { type: 'array', items: { type: 'object' } },
                                },
                            },
                        },
                    },
                },

                // === Errors ===
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Error message' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/**/*.controller.ts',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export { options };
