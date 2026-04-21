import { Node, Edge, FilterOptions } from '../models/graph.model';
import { BaseFilter } from './base.filter';

export class PublicStartFilter extends BaseFilter {
  matches(node: Node, options: FilterOptions): boolean {
    return node.publicExposed === true;
  }

  apply(nodes: Node[], edges: Edge[], options: FilterOptions): { nodes: Node[], edges: Edge[] } {
    if (!options.startFromPublic) {
      return { nodes, edges };
    }

    const publicNodes = this.filterNodes(nodes, options);
    const publicNodeNames = new Set(publicNodes.map(n => n.name));
    
    // Find all reachable nodes from public services
    const reachableNodes = this.findReachableNodes(publicNodeNames, edges);
    const allRelevantNodes = new Set([...publicNodeNames, ...reachableNodes]);
    
    const filteredNodes = nodes.filter(n => allRelevantNodes.has(n.name));
    const filteredEdges = this.filterEdges(edges, allRelevantNodes);
    
    return { nodes: filteredNodes, edges: filteredEdges };
  }

  private findReachableNodes(startNodes: Set<string>, edges: Edge[]): Set<string> {
    const visited = new Set<string>();
    const queue = Array.from(startNodes);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      
      visited.add(current);
      
      const outgoingEdges = edges.filter(e => e.from === current);
      for (const edge of outgoingEdges) {
        const targets = Array.isArray(edge.to) ? edge.to : [edge.to];
        for (const target of targets) {
          if (!visited.has(target)) {
            queue.push(target);
          }
        }
      }
    }
    
    return visited;
  }
}

export class SinkEndFilter extends BaseFilter {
  matches(node: Node, options: FilterOptions): boolean {
    return node.kind === 'rds' || node.kind === 'sqs';
  }

  apply(nodes: Node[], edges: Edge[], options: FilterOptions): { nodes: Node[], edges: Edge[] } {
    if (!options.endInSink) {
      return { nodes, edges };
    }

    const sinkNodes = this.filterNodes(nodes, options);
    const sinkNodeNames = new Set(sinkNodes.map(n => n.name));
    
    // Find all nodes that can reach sink nodes
    const reachableNodes = this.findUpstreamNodes(sinkNodeNames, edges);
    const allRelevantNodes = new Set([...sinkNodeNames, ...reachableNodes]);
    
    const filteredNodes = nodes.filter(n => allRelevantNodes.has(n.name));
    const filteredEdges = this.filterEdges(edges, allRelevantNodes);
    
    return { nodes: filteredNodes, edges: filteredEdges };
  }

  private findUpstreamNodes(endNodes: Set<string>, edges: Edge[]): Set<string> {
    const visited = new Set<string>();
    const queue = Array.from(endNodes);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      
      visited.add(current);
      
      const incomingEdges = edges.filter(e => {
        if (Array.isArray(e.to)) {
          return e.to.includes(current);
        }
        return e.to === current;
      });
      
      for (const edge of incomingEdges) {
        if (!visited.has(edge.from)) {
          queue.push(edge.from);
        }
      }
    }
    
    return visited;
  }
}

export class VulnerabilityFilter extends BaseFilter {
  matches(node: Node, options: FilterOptions): boolean {
    return !!(node.vulnerabilities && node.vulnerabilities.length > 0);
  }

  apply(nodes: Node[], edges: Edge[], options: FilterOptions): { nodes: Node[], edges: Edge[] } {
    if (!options.hasVulnerability) {
      return { nodes, edges };
    }

    const vulnerableNodes = this.filterNodes(nodes, options);
    const vulnerableNodeNames = new Set(vulnerableNodes.map(n => n.name));
    
    const filteredNodes = nodes.filter(n => vulnerableNodeNames.has(n.name));
    const filteredEdges = this.filterEdges(edges, vulnerableNodeNames);
    
    return { nodes: filteredNodes, edges: filteredEdges };
  }
}

export class FilterChain {
  private filters: BaseFilter[] = [];

  addFilter(filter: BaseFilter): void {
    this.filters.push(filter);
  }

  apply(nodes: Node[], edges: Edge[], options: FilterOptions): { nodes: Node[], edges: Edge[] } {
    let result = { nodes, edges };
    
    for (const filter of this.filters) {
      result = filter.apply(result.nodes, result.edges, options);
    }
    
    return result;
  }
}