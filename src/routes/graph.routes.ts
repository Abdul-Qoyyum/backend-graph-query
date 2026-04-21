import { Router } from 'express';
import { GraphController } from '../controllers/graph.controller';

const router = Router();
const graphController = new GraphController();

router.get('/graph', graphController.getGraph);
router.get('/routes', graphController.getRoutes);
router.get('/node/:name', graphController.getNode);
router.get('/nodes/kind/:kind', graphController.getNodesByKind);
router.get('/public-services', graphController.getPublicServices);
router.get('/vulnerable-services', graphController.getVulnerableServices);

export default router;