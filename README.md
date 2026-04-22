# Train Ticket Microservices Graph Query API

A RESTful API for querying and analyzing the Train Ticket microservices architecture graph.

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- `make` (standard on macOS and Linux)

### Setup
1. **Clone the repository**
2. **Grant execution permissions to scripts**:
   ```bash
   chmod +x scripts/run-tests.sh scripts/docker-commands.sh
   ```
3. **Initialize the project**:
   ```bash
   make build
   ```

## 📂 Project Structure

```text
backend-graph-query/
├── .github/
│   └── workflows/
│       └── ci.yml
├── data/
│   └── train-ticket-be.json
├── scripts/
│   ├── docker-commands.sh
│   └── run-tests.sh
├── src/
│   ├── controllers/
│   │   └── graph.controller.ts
│   ├── filters/
│   │   ├── base.filter.ts
│   │   └── index.ts
│   ├── models/
│   │   └── graph.model.ts
│   ├── routes/
│   │   └── graph.routes.ts
│   ├── services/
│   │   └── graph.service.ts
│   ├── index.ts
│   └── swagger.ts
├── test-results/
│   └── .gitignore
├── tests/
│   ├── integration/
│   │   └── api.test.ts
│   └── unit/
│       ├── filters.test.ts
│       └── graph.service.test.ts
├── .dockerignore
├── .gitignore
├── Dockerfile
├── Dockerfile.dev
├── Dockerfile.test
├── Makefile
├── README.md
├── docker-compose.override.yml
├── docker-compose.prod.yml
├── docker-compose.yml
├── jest.config.js
├── package-lock.json
├── package.json
└── tsconfig.json
```

## 🛠 Development & Production

### Run in Development Mode
Starts the application with hot-reload (nodemon) and a debugger listening on port `9229`.
```bash
make dev
```

### Run in Production Mode
Starts the production-optimized container.
```bash
make up
```

### Accessing the API
Once running, you can access:
- **Swagger Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🧪 Testing

The project uses Jest for unit and integration testing, executed inside Docker for environment consistency.

- **Run all tests**:
  ```bash
  make test
  ```
- **Watch mode** (for development):
  ```bash
  make test-watch
  ```
- **Coverage report**:
  ```bash
  make test-coverage
  ```

## 🧠 Solution Overview

The system is designed as a modular **Graph Analysis Engine** that processes microservice dependency data. The primary goal is to provide a flexible way to query complex service relationships without the overhead of a dedicated graph database (like Neo4j) for this scale.

### Key Assumptions
- **Static Graph Model**: The service graph is relatively static and can be loaded fully into memory at startup.
- **Scale**: The system is optimized for small-to-medium graphs (dozens to hundreds of nodes), which is typical for a microservices architecture.
- **Read-Heavy Workload**: The API is optimized for fast query responses over data mutation.

### Core Design Decisions

#### 1. Filter Strategy Pattern
I implemented a **Chainable Strategy Pattern** for graph filtering. This allows developers to compose complex queries (e.g., "Show me vulnerable services reachable from the public web") by simply stacking modular filter classes (`PublicStartFilter`, `SinkEndFilter`, etc.) without modifying the core traversal engine.

#### 2. Adjacency List Traversal
While the source data is a flat list of edges, I convert this into an **Adjacency List** at runtime. This allows for $O(1)$ lookup of direct neighbors, significantly improving the performance of the Depth-First Search (DFS) used for route finding.

#### 3. In-Memory Processing
To maximize speed and minimize infrastructure complexity, I use an in-memory storage approach. The graph is loaded from a JSON file into a service singleton, ensuring that all graph operations are handled at CPU/RAM speeds rather than waiting for disk or network I/O.

#### 4. TypeScript & Strict Compliance
I utilized TypeScript's strict mode to ensure data integrity during graph transformations. This prevents common "null-pointer" errors when navigating nodes that might not exist in the current filtered view.

## 📡 API Endpoints Summary


- `GET /api/graph`: Retrieve the graph with optional filters (`startFromPublic`, `endInSink`, `hasVulnerability`).
- `GET /api/routes`: Find paths between two nodes (`from`, `to`, `maxDepth`).
- `GET /api/node/:name`: Get detailed metadata for a specific service.
- `GET /api/nodes/kind/:kind`: Filter nodes by type (`service`, `rds`, `sqs`).
- `GET /api/public-services`: Quick access to all public-facing nodes.
- `GET /api/vulnerable-services`: Identify all nodes with known vulnerabilities.