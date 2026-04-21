import { Node, Edge, FilterOptions } from '../models/graph.model';

export interface FilterStrategy {
  apply(nodes: Node[], edges: Edge[], options: FilterOptions): { nodes: Node[], edges: Edge[] };
  matches(node: Node, options: FilterOptions): boolean;
}

export abstract class BaseFilter implements FilterStrategy {
  abstract apply(nodes: Node[], edges: Edge[], options: FilterOptions): { nodes: Node[], edges: Edge[] };
  abstract matches(node: Node, options: FilterOptions): boolean;

  protected filterNodes(nodes: Node[], options: FilterOptions): Node[] {
    return nodes.filter(node => this.matches(node, options));
  }

  protected filterEdges(edges: Edge[], validNodeNames: Set<string>): Edge[] {
    return edges.filter(edge => {
      if (Array.isArray(edge.to)) {
        const filteredTo = edge.to.filter(toNode => validNodeNames.has(toNode));
        if (filteredTo.length > 0) {
          edge.to = filteredTo;
          return true;
        }
        return false;
      }
      return validNodeNames.has(edge.from) && validNodeNames.has(edge.to);
    });
  }
}