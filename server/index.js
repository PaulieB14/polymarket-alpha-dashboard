const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

app.use(express.json());

// The Graph endpoints
const GRAPH_ENDPOINTS = {
  polymarket: 'https://api.thegraph.com/subgraphs/name/polymarket/polymarket-v2',
  // Add more subgraph endpoints as needed
};

// Proxy endpoint for GraphQL queries
app.post('/api/graphql', async (req, res) => {
  try {
    const { query, variables, subgraph = 'polymarket' } = req.body;
    
    const endpoint = GRAPH_ENDPOINTS[subgraph];
    if (!endpoint) {
      return res.status(400).json({ error: 'Invalid subgraph' });
    }

    const response = await axios.post(endpoint, {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from The Graph',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
