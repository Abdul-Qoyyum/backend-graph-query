import { PublicStartFilter, SinkEndFilter, VulnerabilityFilter, FilterChain } from '../../src/filters';
import { Node, Edge } from '../../src/models/graph.model';

describe('Filters', () => {
  const mockNodes: Node[] = [
    { name: 'public-service', kind: 'service', publicExposed: true },
    { name: 'private-service', kind: 'service', publicExposed: false },
    {
      name: 'vulnerable-service', kind: 'service', publicExposed: false, vulnerabilities: [{
        file: 'test.java',
        severity: 'high',
        message: 'Test vulnerability',
        metadata: { cwe: 'CWE-22' }
      }]
    },
    { name: 'database', kind: 'rds' },
    { name: 'queue', kind: 'sqs' }
  ];

  const mockEdges: Edge[] = [
    { from: 'public-service', to: 'private-service' },
    { from: 'private-service', to: 'vulnerable-service' },
    { from: 'vulnerable-service', to: 'database' },
    { from: 'public-service', to: 'queue' }
  ];

  describe('PublicStartFilter', () => {
    it('should identify public services', () => {
      const filter = new PublicStartFilter();

      expect(filter.matches(mockNodes[0], {})).toBe(true);
      expect(filter.matches(mockNodes[1], {})).toBe(false);
    });

    it('should filter graph starting from public services', () => {
      const filter = new PublicStartFilter();
      const result = filter.apply(mockNodes, mockEdges, { startFromPublic: true });

      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes.some(n => n.name === 'public-service')).toBe(true);
    });
  });

  describe('SinkEndFilter', () => {
    it('should identify sink nodes', () => {
      const filter = new SinkEndFilter();

      expect(filter.matches(mockNodes[3], {})).toBe(true); // database
      expect(filter.matches(mockNodes[4], {})).toBe(true); // queue
      expect(filter.matches(mockNodes[0], {})).toBe(false);
    });

    it('should filter graph ending in sinks', () => {
      const filter = new SinkEndFilter();
      const result = filter.apply(mockNodes, mockEdges, { endInSink: true });

      expect(result.nodes.some(n => n.kind === 'rds')).toBe(true);
      expect(result.nodes.some(n => n.kind === 'sqs')).toBe(true);
    });
  });

  describe('VulnerabilityFilter', () => {
    it('should identify vulnerable nodes', () => {
      const filter = new VulnerabilityFilter();

      expect(filter.matches(mockNodes[2], {})).toBe(true);
      expect(filter.matches(mockNodes[0], {})).toBe(false);
    });

    it('should filter graph with vulnerable nodes', () => {
      const filter = new VulnerabilityFilter();
      const result = filter.apply(mockNodes, mockEdges, { hasVulnerability: true });

      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].name).toBe('vulnerable-service');
    });
  });

  describe('FilterChain', () => {
    it('should apply multiple filters in sequence', () => {
      const filterChain = new FilterChain();
      filterChain.addFilter(new PublicStartFilter());
      filterChain.addFilter(new SinkEndFilter());

      const result = filterChain.apply(mockNodes, mockEdges, {
        startFromPublic: true,
        endInSink: true
      });

      expect(result.nodes.length).toBeGreaterThan(0);
    });

    it('should not filter when options are false', () => {
      const filterChain = new FilterChain();
      filterChain.addFilter(new PublicStartFilter());

      const result = filterChain.apply(mockNodes, mockEdges, { startFromPublic: false });

      expect(result.nodes.length).toBe(mockNodes.length);
      expect(result.edges.length).toBe(mockEdges.length);
    });
  });
});