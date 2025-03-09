const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FabTrack API',
    version: '1.0.0',
    description: 'API documentation for the FabTrack equipment tracking system'
  },
  servers: [
    {
      url: 'https://backendservice-9fbf.onrender.com/',
      description: 'Production Server'
    },
    {
      url: 'http://localhost:3000/',
      description: 'Development test server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  //console.log('Swagger UI available https://backendservice-9fbf.onrender.com/api-docs');
};

module.exports = setupSwagger;
