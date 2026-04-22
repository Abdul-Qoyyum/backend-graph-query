import { Router } from 'express';
import { GraphController } from '../controllers/graph.controller';

const router = Router();
const graphController = new GraphController();

/**
 * @openapi
 * /api/graph:
 *   get:
 *     summary: Retrieve the dependency graph
 *     description: Returns the list of nodes and edges in the system. Supports filtering by exposure, sinks, and vulnerabilities.
 *     parameters:
 *       - in: query
 *         name: startFromPublic
 *         schema:
 *           type: boolean
 *         description: If true, only returns nodes reachable from public-facing services.
 *       - in: query
 *         name: endInSink
 *         schema:
 *           type: boolean
 *         description: If true, only returns nodes that eventually lead to a sink (RDS or SQS).
 *       - in: query
 *         name: hasVulnerability
 *         schema:
 *           type: boolean
 *         description: If true, only returns nodes that have known vulnerabilities.
 *     responses:
 *       200:
 *         description: A graph object containing nodes and edges.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GraphResponse'
 */
router.get('/graph', graphController.getGraph);

/**
 * @openapi
 * /api/routes:
 *   get:
 *     summary: Find routes between two nodes
 *     description: Performs a depth-first search to find all possible paths between the specified 'from' and 'to' nodes.
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         example: travel-plan-service
 *         description: The starting node name.
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         example: train-service
 *         description: The target node name.
 *       - in: query
 *         name: maxDepth
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum path length to search.
 *     responses:
 *       200:
 *         description: A list of found routes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 count: { type: 'integer' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/Route' } }
 *             example:
 *               success: true
 *               count: 9
 *               data:
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, route-plan-service, travel-service, basic-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: route-plan-service, kind: service, language: java, path: train-ticket/ts-route-plan-service, publicExposed: false }
 *                     - { name: travel-service, kind: service, language: java, path: train-ticket/ts-travel-service, publicExposed: false }
 *                     - { name: basic-service, kind: service, language: java, path: train-ticket/ts-basic-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, route-plan-service, travel-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: route-plan-service, kind: service, language: java, path: train-ticket/ts-route-plan-service, publicExposed: false }
 *                     - { name: travel-service, kind: service, language: java, path: train-ticket/ts-travel-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, route-plan-service, travel2-service, basic-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: route-plan-service, kind: service, language: java, path: train-ticket/ts-route-plan-service, publicExposed: false }
 *                     - { name: travel2-service, kind: service, language: java, path: train-ticket/ts-travel2-service, publicExposed: false }
 *                     - { name: basic-service, kind: service, language: java, path: train-ticket/ts-basic-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, route-plan-service, travel2-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: route-plan-service, kind: service, language: java, path: train-ticket/ts-route-plan-service, publicExposed: false }
 *                     - { name: travel2-service, kind: service, language: java, path: train-ticket/ts-travel2-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, travel-service, basic-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: travel-service, kind: service, language: java, path: train-ticket/ts-travel-service, publicExposed: false }
 *                     - { name: basic-service, kind: service, language: java, path: train-ticket/ts-basic-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, travel-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: travel-service, kind: service, language: java, path: train-ticket/ts-travel-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, travel2-service, basic-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: travel2-service, kind: service, language: java, path: train-ticket/ts-travel2-service, publicExposed: false }
 *                     - { name: basic-service, kind: service, language: java, path: train-ticket/ts-basic-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, travel2-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: travel2-service, kind: service, language: java, path: train-ticket/ts-travel2-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *                 - from: travel-plan-service
 *                   to: train-service
 *                   path: [travel-plan-service, train-service]
 *                   nodes:
 *                     - { name: travel-plan-service, kind: service, language: java, path: train-ticket/ts-travel-plan-service, publicExposed: false }
 *                     - { name: train-service, kind: service, language: java, path: train-ticket/ts-train-service, publicExposed: false }
 *       400:
 *         description: Missing required parameters.
 */
router.get('/routes', graphController.getRoutes);

/**
 * @openapi
 * /api/node/{name}:
 *   get:
 *     summary: Get node details
 *     description: Returns detailed information about a specific node, including its direct upstream and downstream neighbors.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: travel-plan-service
 *     responses:
 *       200:
 *         description: Detailed node information.
 *       404:
 *         description: Node not found.
 */
router.get('/node/:name', graphController.getNode);

/**
 * @openapi
 * /api/nodes/kind/{kind}:
 *   get:
 *     summary: Get nodes by kind
 *     description: Returns all nodes of a specific kind (service, rds, or sqs).
 *     parameters:
 *       - in: path
 *         name: kind
 *         required: true
 *         schema:
 *           type: string
 *           enum: [service, rds, sqs]
 *         example: rds
 *     responses:
 *       200:
 *         description: A list of nodes of the requested kind.
 */
router.get('/nodes/kind/:kind', graphController.getNodesByKind);

/**
 * @openapi
 * /api/public-services:
 *   get:
 *     summary: Get all public-facing services
 *     description: Returns a list of all nodes that are explicitly marked as publicExposed.
 *     responses:
 *       200:
 *         description: A list of public services.
 */
router.get('/public-services', graphController.getPublicServices);

/**
 * @openapi
 * /api/vulnerable-services:
 *   get:
 *     summary: Get all vulnerable nodes
 *     description: Returns a list of all nodes that contain at least one vulnerability.
 *     responses:
 *       200:
 *         description: A list of vulnerable nodes.
 */
router.get('/vulnerable-services', graphController.getVulnerableServices);

export default router;