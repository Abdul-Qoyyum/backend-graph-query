import { GraphService } from '../../src/services/graph.service';

describe('GraphService', () => {
  let graphService: GraphService;

  beforeEach(() => {
    graphService = new GraphService();
  });

  describe('getGraph', () => {
    it('should return all nodes and edges when no filters applied', () => {
      const result = graphService.getGraph();
      
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.edges.length).toBeGreaterThan(0);
    });

    it('should filter routes starting from public services', () => {
      const result = graphService.getGraph({ startFromPublic: true });
      
      const publicNodes = result.nodes.filter(n => n.publicExposed === true);
      expect(publicNodes.length).toBeGreaterThan(0);
    });

    it('should filter routes ending in sinks', () => {
      const result = graphService.getGraph({ endInSink: true });
      
      const sinkNodes = result.nodes.filter(n => n.kind === 'rds' || n.kind === 'sqs');
      expect(sinkNodes.length).toBeGreaterThan(0);
    });

    it('should filter nodes with vulnerabilities', () => {
      const result = graphService.getGraph({ hasVulnerability: true });
      
      const vulnerableNodes = result.nodes.filter(n => n.vulnerabilities && n.vulnerabilities.length > 0);
      expect(vulnerableNodes.length).toBeGreaterThan(0);
    });
  });

  describe('findRoutes', () => {
    it('should find routes between two connected services', () => {
      const routes = graphService.findRoutes('frontend', 'admin-basic-info-service');
      
      expect(routes.length).toBeGreaterThan(0);
      expect(routes[0].path).toContain('frontend');
      expect(routes[0].path).toContain('admin-basic-info-service');
    });

    it('should return empty array for disconnected services', () => {
      const routes = graphService.findRoutes('frontend', 'non-existent-service');
      
      expect(routes).toEqual([]);
    });

    it('should respect maxDepth parameter', () => {
      const routes = graphService.findRoutes('frontend', 'prod-postgresdb', 2);
      
      routes.forEach(route => {
        expect(route.path.length).toBeLessThanOrEqual(3); // +1 for the starting node
      });
    });
  });

  describe('getNode', () => {
    it('should return node details for existing node', () => {
      const node = graphService.getNode('frontend');
      
      expect(node).toBeDefined();
      expect(node?.name).toBe('frontend');
      expect(node?.publicExposed).toBe(true);
    });

    it('should return undefined for non-existent node', () => {
      const node = graphService.getNode('non-existent');
      
      expect(node).toBeUndefined();
    });
  });

  describe('getNodesByKind', () => {
    it('should return all service nodes', () => {
      const services = graphService.getNodesByKind('service');
      
      expect(services.length).toBeGreaterThan(0);
      services.forEach(service => {
        expect(service.kind).toBe('service');
      });
    });

    it('should return all rds nodes', () => {
      const rdsNodes = graphService.getNodesByKind('rds');
      
      rdsNodes.forEach(node => {
        expect(node.kind).toBe('rds');
      });
    });
  });
});