import fs from 'fs';
import swaggerJsdoc from 'swagger-jsdoc';
import { options } from '../config/swagger';

const swaggerSpec = swaggerJsdoc(options);

fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));
console.log('✅ Swagger JSON exported to swagger.json');
