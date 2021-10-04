/**
  This file is to generate automatic documentation for the REST API
  You can ignore this file
*/
import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  swaggerDefinition: {
    components: {},
    info: {
      title: 'Stocks Portfolio Backend API',
      version: '1.0.0'
    }
  },
  apis: ['./src/*.js']
}
export const swaggerDocs = swaggerJSDoc(swaggerOptions); 
