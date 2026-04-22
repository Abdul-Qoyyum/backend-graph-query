import { Request, Response } from 'express';
import { GraphService } from '../services/graph.service';
import { FilterOptions } from '../models/graph.model';

export class GraphController {
  private graphService: GraphService;

  constructor() {
    this.graphService = new GraphService();
  }

  getGraph = (req: Request, res: Response): void => {
    try {
      const options: FilterOptions = {
        startFromPublic: req.query.startFromPublic === 'true',
        endInSink: req.query.endInSink === 'true',
        hasVulnerability: req.query.hasVulnerability === 'true'
      };

      const graph = this.graphService.getGraph(options);

      res.json({
        success: true,
        data: graph,
        filters: options
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve graph data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getRoutes = (req: Request, res: Response): void => {
    try {
      const { from, to } = req.query;
      const maxDepth = req.query.maxDepth ? parseInt(req.query.maxDepth as string) : 10;

      if (!from || !to) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: from and to'
        });
        return;
      }

      const routes = this.graphService.findRoutes(from as string, to as string, maxDepth);

      res.json({
        success: true,
        count: routes.length,
        data: routes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to find routes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getNode = (req: Request, res: Response): void => {
    try {
      const { name } = req.params;
      const node = this.graphService.getNode(name);

      if (!node) {
        res.status(404).json({
          success: false,
          error: `Node '${name}' not found`
        });
        return;
      }

      const upstream = this.graphService.getUpstreamNodes(name);
      const downstream = this.graphService.getDownstreamNodes(name);

      res.json({
        success: true,
        data: {
          node,
          upstream,
          downstream
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve node',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getNodesByKind = (req: Request, res: Response): void => {
    try {
      const { kind } = req.params;
      const nodes = this.graphService.getNodesByKind(kind);

      res.json({
        success: true,
        count: nodes.length,
        data: nodes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve nodes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getPublicServices = (req: Request, res: Response): void => {
    try {
      const graph = this.graphService.getGraph({ startFromPublic: true });
      const publicNodes = graph.nodes.filter(n => n.publicExposed === true);

      res.json({
        success: true,
        count: publicNodes.length,
        data: publicNodes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve public services',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getVulnerableServices = (req: Request, res: Response): void => {
    try {
      const graph = this.graphService.getGraph({ hasVulnerability: true });

      res.json({
        success: true,
        count: graph.nodes.length,
        data: graph.nodes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve vulnerable services',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}