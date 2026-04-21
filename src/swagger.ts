import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Graph Query API',
      version,
      description: 'API for querying and analyzing the microservice dependency graph of the Train-Ticket system.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Vulnerability: {
          type: 'object',
          properties: {
            file: { type: 'string', example: 'ts-order-service/src/main/java/order/service/OrderServiceImpl.java' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
            message: { type: 'string', example: 'Potential SQL Injection in findByOrderId' },
            metadata: {
              type: 'object',
              properties: {
                cwe: { type: 'string', example: 'CWE-89' }
              }
            }
          }
        },
        Node: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'ts-order-service' },
            kind: { type: 'string', enum: ['service', 'rds', 'sqs'], example: 'service' },
            language: { type: 'string', example: 'java' },
            path: { type: 'string', example: 'ts-order-service' },
            publicExposed: { type: 'boolean', example: false },
            vulnerabilities: {
              type: 'array',
              items: { $ref: '#/components/schemas/Vulnerability' }
            },
            metadata: { type: 'object' }
          }
        },
        Edge: {
          type: 'object',
          properties: {
            from: { type: 'string', example: 'ts-ui-dashboard' },
            to: { 
              oneOf: [
                { type: 'string', example: 'ts-order-service' },
                { type: 'array', items: { type: 'string' }, example: ['ts-order-service', 'ts-user-service'] }
              ]
            }
          }
        },
        Route: {
          type: 'object',
          properties: {
            from: { type: 'string', example: 'ts-ui-dashboard' },
            to: { type: 'string', example: 'ts-order-db' },
            path: { type: 'array', items: { type: 'string' }, example: ['ts-ui-dashboard', 'ts-order-service', 'ts-order-db'] },
            nodes: {
              type: 'array',
              items: { $ref: '#/components/schemas/Node' }
            }
          }
        },
        GraphResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                nodes: { type: 'array', items: { $ref: '#/components/schemas/Node' } },
                edges: { type: 'array', items: { $ref: '#/components/schemas/Edge' } }
              }
            },
            filters: { type: 'object' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
