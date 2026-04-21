import { GraphData, Node, Edge, Route, FilterOptions } from '../models/graph.model';
import { FilterChain, PublicStartFilter, SinkEndFilter, VulnerabilityFilter } from '../filters';
import * as fs from 'fs';
import * as path from 'path';

export class GraphService {
  private graphData!: GraphData;
  private filterChain!: FilterChain;
  private adjacencyList: Map<string, Set<string>> = new Map();
  private reverseAdjacencyList: Map<string, Set<string>> = new Map();

  constructor() {
    this.loadGraphData();
    this.buildAdjacencyLists();
    this.initializeFilters();
  }

  private loadGraphData(): void {
    const dataPath = path.join(__dirname, '../../data/train-ticket-be.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.graphData = JSON.parse(rawData);
  }

  private buildAdjacencyLists(): void {
    this.graphData.edges.forEach(edge => {
      if (!this.adjacencyList.has(edge.from)) {
        this.adjacencyList.set(edge.from, new Set());
      }
      
      const targets = Array.isArray(edge.to) ? edge.to : [edge.to];
      targets.forEach(target => {
        this.adjacencyList.get(edge.from)!.add(target);
        
        if (!this.reverseAdjacencyList.has(target)) {
          this.reverseAdjacencyList.set(target, new Set());
        }
        this.reverseAdjacencyList.get(target)!.add(edge.from);
      });
    });
  }

  private initializeFilters(): void {
    this.filterChain = new FilterChain();
    this.filterChain.addFilter(new PublicStartFilter());
    this.filterChain.addFilter(new SinkEndFilter());
    this.filterChain.addFilter(new VulnerabilityFilter());
  }

  getGraph(options: FilterOptions = {}): { nodes: Node[], edges: Edge[] } {
    return this.filterChain.apply(
      this.graphData.nodes,
      this.graphData.edges,
      options
    );
  }

  findRoutes(from: string, to: string, maxDepth: number = 10): Route[] {
    const routes: Route[] = [];
    const visited = new Set<string>();
    
    this.dfs(from, to, [from], visited, routes, maxDepth);
    
    return routes;
  }

  private dfs(
    current: string,
    target: string,
    path: string[],
    visited: Set<string>,
    routes: Route[],
    maxDepth: number
  ): void {
    if (path.length > maxDepth) return;
    
    if (current === target) {
      const routeNodes = path.map(name => 
        this.graphData.nodes.find(n => n.name === name)!
      );
      routes.push({
        from: path[0],
        to: path[path.length - 1],
        path: [...path],
        nodes: routeNodes
      });
      return;
    }
    
    const neighbors = this.adjacencyList.get(current) || new Set();
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        path.push(neighbor);
        this.dfs(neighbor, target, path, visited, routes, maxDepth);
        path.pop();
        visited.delete(neighbor);
      }
    }
  }

  getNode(name: string): Node | undefined {
    return this.graphData.nodes.find(n => n.name === name);
  }

  getNodesByKind(kind: string): Node[] {
    return this.graphData.nodes.filter(n => n.kind === kind);
  }

  getUpstreamNodes(nodeName: string): string[] {
    return Array.from(this.reverseAdjacencyList.get(nodeName) || new Set());
  }

  getDownstreamNodes(nodeName: string): string[] {
    return Array.from(this.adjacencyList.get(nodeName) || new Set());
  }

  addFilter(filter: any): void {
    this.filterChain.addFilter(filter);
  }
}