# Train Ticket Microservices Graph Query API

A RESTful API for querying and analyzing the Train Ticket microservices architecture graph.

## Features

- **Graph Querying**: Retrieve the complete service graph with relationships
- **Flexible Filtering**: Filter routes based on:
  - Starting from public services (`publicExposed: true`)
  - Ending in sinks (RDS/SQS)
  - Services with vulnerabilities
- **Route Finding**: Discover all possible routes between services
- **Node Inspection**: Get detailed information about specific services
- **Extensible Filter System**: Easily add new filter strategies

## Architecture Decisions

### 1. **Filter Strategy Pattern**
Used the Strategy pattern for filters to make the system easily extensible. Each filter implements the `FilterStrategy` interface, allowing new filters to be added without modifying existing code.

### 2. **Adjacency List Representation**
Converted edge list to adjacency lists for efficient graph traversal and route finding operations.

### 3. **In-Memory Data Storage**
The JSON file is loaded into memory at startup for fast query performance. Suitable for the graph size (~50 nodes, ~30 edges).

### 4. **TypeScript Implementation**
Chose TypeScript for:
- Type safety and better developer experience
- Easier maintenance and refactoring
- Better IDE support

## API Endpoints

### Graph Operations

#### `GET /api/graph`
Retrieve the graph with optional filters.

**Query Parameters:**
- `startFromPublic` (boolean): Filter routes starting from public services
- `endInSink` (boolean): Filter routes ending in RDS/SQS
- `hasVulnerability` (boolean): Filter services with vulnerabilities

**Example:**
```bash
curl "http://localhost:3000/api/graph?startFromPublic=true&hasVulnerability=true"