
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0', 
    info: {
        title: 'FabTrack API',
        version: '1.0.0',
        description: 'API documentation for the FabTrack equipment tracking system',
    },
    servers: [
        {
            url: 'http://localhost:3000/', // To be changed during deployment
            description: 'Local development server',
        },
    ],
};

// Swagger options
const options = {
    swaggerDefinition,
    apis: ['./src/routes/**/*.js'],
};

// Initialize Swagger docs
const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger UI is available at http://localhost:3000/api-docs');
};

module.exports = setupSwagger;
