import express from 'express';
import cors from 'cors';
import graphRoutes from './routes/graph.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', graphRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET /api/graph - Get graph with optional filters`);
    console.log(`  GET /api/routes?from=X&to=Y - Find routes between services`);
    console.log(`  GET /api/node/:name - Get node details`);
    console.log(`  GET /api/nodes/kind/:kind - Get nodes by kind`);
    console.log(`  GET /api/public-services - Get public services`);
    console.log(`  GET /api/vulnerable-services - Get vulnerable services`);
  });
}

export default app;