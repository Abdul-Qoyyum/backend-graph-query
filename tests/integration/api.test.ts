import request from 'supertest';
import app from '../../src/index';

describe('Graph API Integration Tests', () => {
  describe('GET /api/graph', () => {
    it('should return full graph without filters', async () => {
      const response = await request(app)
        .get('/api/graph')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.nodes).toBeDefined();
      expect(response.body.data.edges).toBeDefined();
    });

    it('should apply startFromPublic filter', async () => {
      const response = await request(app)
        .get('/api/graph?startFromPublic=true')
        .expect(200);
      
      expect(response.body.filters.startFromPublic).toBe(true);
      expect(response.body.data.nodes.length).toBeGreaterThan(0);
    });

    it('should apply endInSink filter', async () => {
      const response = await request(app)
        .get('/api/graph?endInSink=true')
        .expect(200);
      
      expect(response.body.filters.endInSink).toBe(true);
    });

    it('should apply hasVulnerability filter', async () => {
      const response = await request(app)
        .get('/api/graph?hasVulnerability=true')
        .expect(200);
      
      expect(response.body.filters.hasVulnerability).toBe(true);
      response.body.data.nodes.forEach((node: any) => {
        expect(node.vulnerabilities).toBeDefined();
        expect(node.vulnerabilities.length).toBeGreaterThan(0);
      });
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/graph?startFromPublic=true&endInSink=true')
        .expect(200);
      
      expect(response.body.filters.startFromPublic).toBe(true);
      expect(response.body.filters.endInSink).toBe(true);
    });
  });

  describe('GET /api/routes', () => {
    it('should find routes between frontend and admin-basic-info-service', async () => {
      const response = await request(app)
        .get('/api/routes?from=frontend&to=admin-basic-info-service')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].path).toContain('frontend');
      expect(response.body.data[0].path).toContain('admin-basic-info-service');
    });

    it('should return 400 when parameters are missing', async () => {
      const response = await request(app)
        .get('/api/routes')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required parameters');
    });

    it('should respect maxDepth parameter', async () => {
      const response = await request(app)
        .get('/api/routes?from=frontend&to=prod-postgresdb&maxDepth=2')
        .expect(200);
      
      response.body.data.forEach((route: any) => {
        expect(route.path.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('GET /api/node/:name', () => {
    it('should return node details for existing service', async () => {
      const response = await request(app)
        .get('/api/node/frontend')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.node.name).toBe('frontend');
      expect(response.body.data.node.publicExposed).toBe(true);
      expect(response.body.data.upstream).toBeDefined();
      expect(response.body.data.downstream).toBeDefined();
    });

    it('should return 404 for non-existent node', async () => {
      const response = await request(app)
        .get('/api/node/non-existent')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/nodes/kind/:kind', () => {
    it('should return all service nodes', async () => {
      const response = await request(app)
        .get('/api/nodes/kind/service')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      response.body.data.forEach((node: any) => {
        expect(node.kind).toBe('service');
      });
    });

    it('should return all rds nodes', async () => {
      const response = await request(app)
        .get('/api/nodes/kind/rds')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      response.body.data.forEach((node: any) => {
        expect(node.kind).toBe('rds');
      });
    });
  });

  describe('GET /api/public-services', () => {
    it('should return all public services', async () => {
      const response = await request(app)
        .get('/api/public-services')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      response.body.data.forEach((node: any) => {
        expect(node.publicExposed).toBe(true);
      });
    });
  });

  describe('GET /api/vulnerable-services', () => {
    it('should return all services with vulnerabilities', async () => {
      const response = await request(app)
        .get('/api/vulnerable-services')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      response.body.data.forEach((node: any) => {
        expect(node.vulnerabilities).toBeDefined();
        expect(node.vulnerabilities.length).toBeGreaterThan(0);
      });
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});