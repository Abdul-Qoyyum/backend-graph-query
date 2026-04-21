export interface Vulnerability {
  file: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: {
    cwe: string;
  };
}

export interface Node {
  name: string;
  kind: 'service' | 'rds' | 'sqs';
  language?: string;
  path?: string;
  publicExposed?: boolean;
  vulnerabilities?: Vulnerability[];
  metadata?: Record<string, any>;
}

export interface Edge {
  from: string;
  to: string | string[];
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface Route {
  from: string;
  to: string;
  path: string[];
  nodes: Node[];
}

export interface GraphResponse {
  nodes: Node[];
  edges: Edge[];
  routes?: Route[];
}

export interface FilterOptions {
  startFromPublic?: boolean;
  endInSink?: boolean;
  hasVulnerability?: boolean;
  [key: string]: any;
}