import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application, Express } from 'express';
import { shortenDoc } from '../routes/urlRoutes';
import { loginDoc } from '../routes/authRoutes';
import { analyticsDoc } from '../routes/analyticsRoutes';

const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Advanced URL Shortener API',
        version: '1.0.0',
        description: 'API documentation for the Advanced URL Shortener',
    },
    servers: [
        {
            url: 'http://localhost:3000',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
    paths: {
        ...loginDoc,
        ...shortenDoc,
        ...analyticsDoc
    },
};

const setupSwaggerDocs = (app: Express, port: number): void => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
};

export { setupSwaggerDocs };
